
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';

import { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useSettings, useTools, useLogStore, useUI, useTopics, useVideoState } from '@/lib/state';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);
  const continuousModeRef = useRef(continuousMode);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect } = useLiveAPIContext();
  const { toggleSidebar, toggleChat, isChatOpen } = useUI();
  const { selectedTopic } = useTopics();
  const { videoSource } = useVideoState();

  // Sync ref with state
  useEffect(() => {
    continuousModeRef.current = continuousMode;
  }, [continuousMode]);

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(false);
      setContinuousMode(true);
    }
  }, [connected]);

  // Auto-start speaking when connected
  useEffect(() => {
    if (connected) {
      const topicTitle = selectedTopic?.title || 'the selected topic';
      // Use the actual video source state to handle both preset and uploaded videos
      const activeVideoUrl = videoSource || selectedTopic?.video_url;
      const videoContext = activeVideoUrl 
        ? ` The video currently displayed is sourced from: ${activeVideoUrl}.` 
        : '';

      const timer = setTimeout(() => {
        client.send([{ text: `[SYSTEM: Start the presentation about ${topicTitle} immediately. You are the Master Pitch Deck Speaker.${videoContext} You have access to the video feed of this presentation. DO NOT WAIT. GO.]` }]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, client, selectedTopic, videoSource]);

  // Auto-continue handling using Ref to avoid stale closure issues
  useEffect(() => {
    const onTurnComplete = () => {
      if (connected && continuousModeRef.current) {
        // Small delay to ensure proper turn transition on server
        setTimeout(() => {
          client.send([{ text: 'continue' }]);
        }, 500);
      }
    };

    client.on('turncomplete', onTurnComplete);
    return () => {
      client.off('turncomplete', onTurnComplete);
    };
  }, [connected, client]); // Removed continuousMode dependency, using ref instead

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  const handleMicClick = () => {
    if (connected) {
      setMuted(!muted);
    } else {
      connect();
    }
  };

  const micButtonTitle = connected
    ? muted
      ? 'Unmute microphone'
      : 'Mute microphone'
    : 'Connect and start microphone';

  const connectButtonTitle = connected ? 'Stop streaming' : 'Start streaming';

  return (
    <section className="control-tray">
      <nav className={cn('actions-nav')}>
        <button
          className={cn('action-button mic-button')}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          {!muted ? (
            <span className="material-symbols-outlined filled">mic</span>
          ) : (
            <span className="material-symbols-outlined filled">mic_off</span>
          )}
        </button>

        <button
          className={cn('action-button', { active: continuousMode })}
          onClick={() => setContinuousMode(!continuousMode)}
          title="Toggle Continuous Mode"
        >
          <span className="material-symbols-outlined">
            {continuousMode ? 'repeat_on' : 'repeat'}
          </span>
        </button>

        <button
          className={cn('action-button')}
          onClick={toggleSidebar}
          aria-label="Settings"
          title="Open Settings"
        >
          <span className="icon material-symbols-outlined">settings</span>
        </button>
        
        <button
          className={cn('action-button', { active: isChatOpen })}
          onClick={toggleChat}
          aria-label="Chat"
          title="Open Chat"
        >
          <span className="icon material-symbols-outlined">chat</span>
        </button>
        {children}
      </nav>

      <div className={cn('connection-container', { connected })}>
        <div className="connection-button-container">
          <button
            ref={connectButtonRef}
            className={cn('action-button connect-toggle', { connected })}
            onClick={connected ? disconnect : connect}
            title={connectButtonTitle}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
        <span className="text-indicator">Streaming</span>
      </div>
    </section>
  );
}

export default memo(ControlTray);
