
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerContent } from '@google/genai';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import {
  useSettings,
  useLogStore,
  useTools,
  useTopics,
  ConversationTurn,
  useUI,
  useVideoState,
} from '@/lib/state';

const formatTimestamp = (date: Date) => {
  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = pad(date.getMilliseconds(), 3);
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const renderContent = (text: string) => {
  // Split by ```json...``` code blocks
  const parts = text.split(/(`{3}json\n[\s\S]*?\n`{3})/g);

  return parts.map((part, index) => {
    if (part.startsWith('```json')) {
      const jsonContent = part.replace(/^`{3}json\n|`{3}$/g, '');
      return (
        <pre key={index}>
          <code>{jsonContent}</code>
        </pre>
      );
    }

    // Split by **bold** text
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return <strong key={boldIndex}>{boldPart.slice(2, -2)}</strong>;
      }
      return boldPart;
    });
  });
};


export default function StreamingConsole() {
  const { client, setConfig } = useLiveAPIContext();
  const { systemPrompt, voice } = useSettings();
  const { selectedTopic } = useTopics();
  const { videoSource } = useVideoState();
  const { tools } = useTools();
  const { isChatOpen, toggleChat } = useUI();
  const turns = useLogStore(state => state.turns);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState("");

  // Set the configuration for the Live API
  useEffect(() => {
    const enabledTools = tools
      .filter(tool => tool.isEnabled)
      .map(tool => ({
        functionDeclarations: [
          {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        ],
      }));

    // Inject topic details into the system prompt if available
    let finalSystemPrompt = systemPrompt;
    if (selectedTopic) {
      finalSystemPrompt = finalSystemPrompt.replace(/\[Topic\]/g, selectedTopic.title);
      finalSystemPrompt += `\n\n[Topic Details]\nTitle: ${selectedTopic.title}\nDescription: ${selectedTopic.description || 'N/A'}`;
    } else {
        // Fallback if no topic is selected, though one should be selected by default
        finalSystemPrompt = finalSystemPrompt.replace(/\[Topic\]/g, "Technology Innovation");
    }

    // Add Video Source URL to system prompt for context
    if (videoSource) {
      finalSystemPrompt += `\n\n[Video Context]\nThe user is watching a video from: ${videoSource}`;
    }

    // Resolve Voice Name: Map 'Pitch Deck Speaker' to 'Fenrir' (Opal)
    let voiceName = voice;
    if (voice === 'Pitch Deck Speaker') {
      voiceName = 'Fenrir';
    }

    // Using `any` for config to accommodate `speechConfig`, which is not in the
    // current TS definitions but is used in the working reference example.
    const config: any = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName,
          },
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: {
        parts: [
          {
            text: finalSystemPrompt,
          },
        ],
      },
      tools: enabledTools,
    };

    setConfig(config);
  }, [setConfig, systemPrompt, tools, voice, selectedTopic, videoSource]);

  useEffect(() => {
    const { addTurn, updateLastTurn } = useLogStore.getState();

    const handleInputTranscription = (text: string, isFinal: boolean) => {
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];
      if (last && last.role === 'user' && !last.isFinal) {
        updateLastTurn({
          text: last.text + text,
          isFinal,
        });
      } else {
        addTurn({ role: 'user', text, isFinal });
      }
    };

    const handleOutputTranscription = (text: string, isFinal: boolean) => {
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];
      if (last && last.role === 'agent' && !last.isFinal) {
        updateLastTurn({
          text: last.text + text,
          isFinal,
        });
      } else {
        addTurn({ role: 'agent', text, isFinal });
      }
    };

    // FIX: The 'content' event provides a single LiveServerContent object.
    // The function signature is updated to accept one argument, and groundingMetadata is extracted from it.
    const handleContent = (serverContent: LiveServerContent) => {
      const text =
        serverContent.modelTurn?.parts
          ?.map((p: any) => p.text)
          .filter(Boolean)
          .join(' ') ?? '';
      const groundingChunks = serverContent.groundingMetadata?.groundingChunks;

      if (!text && !groundingChunks) return;

      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];

      if (last?.role === 'agent' && !last.isFinal) {
        const updatedTurn: Partial<ConversationTurn> = {
          text: last.text + text,
        };
        if (groundingChunks) {
          updatedTurn.groundingChunks = [
            ...(last.groundingChunks || []),
            ...groundingChunks,
          ];
        }
        updateLastTurn(updatedTurn);
      } else {
        addTurn({ role: 'agent', text, isFinal: false, groundingChunks });
      }
    };

    const handleTurnComplete = () => {
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];
      if (last && !last.isFinal) {
        updateLastTurn({ isFinal: true });
      }
    };

    client.on('inputTranscription', handleInputTranscription);
    client.on('outputTranscription', handleOutputTranscription);
    client.on('content', handleContent);
    client.on('turncomplete', handleTurnComplete);

    return () => {
      client.off('inputTranscription', handleInputTranscription);
      client.off('outputTranscription', handleOutputTranscription);
      client.off('content', handleContent);
      client.off('turncomplete', handleTurnComplete);
    };
  }, [client]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isChatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      client.send([{ text: inputMessage }]);
      setInputMessage("");
    }
  };

  return (
    <div className={`streaming-console-component ${isChatOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <button onClick={toggleChat} className="back-button">
           <span className="material-symbols-outlined">arrow_back</span>
           <span>Back</span>
        </button>
        <h3>Live Chat</h3>
      </div>
      <div className="transcription-view" ref={scrollRef}>
        {turns.map((t, i) => (
          <div
            key={i}
            className={`transcription-entry ${t.role} ${!t.isFinal ? 'interim' : ''
              }`}
          >
            <div className="transcription-header">
              <div className="transcription-source">
                {t.role === 'user'
                  ? 'You'
                  : t.role === 'agent'
                    ? 'Agent'
                    : 'System'}
              </div>
              <div className="transcription-timestamp">
                {formatTimestamp(t.timestamp)}
              </div>
            </div>
            <div className="transcription-text-content">
              {renderContent(t.text)}
            </div>
            {t.groundingChunks && t.groundingChunks.length > 0 && (
              <div className="grounding-chunks">
                <strong>Sources:</strong>
                <ul>
                  {t.groundingChunks
                    .filter(chunk => chunk.web?.uri)
                    .map((chunk, index) => (
                      <li key={index}>
                        <a
                          href={chunk.web?.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {chunk.web?.title || chunk.web?.uri}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" disabled={!inputMessage.trim()}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
