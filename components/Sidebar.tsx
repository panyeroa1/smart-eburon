/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FunctionCall, useSettings, useUI, useTools, useTopics, useVideoState } from '@/lib/state';
import c from 'classnames';
import { DEFAULT_LIVE_API_MODEL, VOICES, LANGUAGES, VOICE_STYLES, SPEECH_PACES } from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';
import { useEffect, useState } from 'react';
import ToolEditorModal from './ToolEditorModal';

const AVAILABLE_MODELS = [
  DEFAULT_LIVE_API_MODEL
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { voice, setVoice, language, setLanguage, voiceStyle, setVoiceStyle, speechPace, setSpeechPace } = useSettings();
  const { tools, toggleTool, addTool, removeTool, updateTool } = useTools();
  const { topics, selectedTopic, fetchTopics, setSelectedTopic, isLoading } = useTopics();
  const { connected } = useLiveAPIContext();
  const { playbackRate, setPlaybackRate, setVideoSource } = useVideoState();

  const [editingTool, setEditingTool] = useState<FunctionCall | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic?.video_url) {
      setVideoSource(selectedTopic.video_url);
    } else {
      setVideoSource(null);
    }
  }, [selectedTopic, setVideoSource]);

  const handleSaveTool = (updatedTool: FunctionCall) => {
    if (editingTool) {
      updateTool(editingTool.name, updatedTool);
    }
    setEditingTool(null);
  };

  return (
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <fieldset disabled={connected}>
              <label>
                Output Language
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Accent & Mannerisms
                <select value={voiceStyle} onChange={e => setVoiceStyle(e.target.value)}>
                  {VOICE_STYLES.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Speech Pace / Cadence
                <select value={speechPace} onChange={e => setSpeechPace(e.target.value)}>
                  {SPEECH_PACES.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voice Model
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {VOICES.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.alias}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          </div>

          <div className="sidebar-section">
             <fieldset>
                <label>Video Playback Speed</label>
                <div className="sidebar-speed-controls">
                   {[0.25, 0.5, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        className={`speed-button ${playbackRate === rate ? 'active' : ''}`}
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </button>
                   ))}
                </div>
             </fieldset>
          </div>
          
          <div className="sidebar-section">
            <fieldset disabled={connected}>
              <label>
                Topic
                {isLoading ? (
                   <select disabled><option>Loading topics...</option></select>
                ) : (
                  <select 
                    value={selectedTopic?.id || ''} 
                    onChange={e => setSelectedTopic(e.target.value)}
                  >
                    {topics.length === 0 && <option value="">No topics found</option>}
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            </fieldset>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Tools</h4>
            <div className="tools-list">
              {tools.map(tool => (
                <div key={tool.name} className="tool-item">
                  <label className="tool-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id={`tool-checkbox-${tool.name}`}
                      checked={tool.isEnabled}
                      onChange={() => toggleTool(tool.name)}
                      disabled={connected}
                    />
                    <span className="checkbox-visual"></span>
                  </label>
                  <label
                    htmlFor={`tool-checkbox-${tool.name}`}
                    className="tool-name-text"
                  >
                    {tool.name}
                  </label>
                  <div className="tool-actions">
                    <button
                      onClick={() => setEditingTool(tool)}
                      disabled={connected}
                      aria-label={`Edit ${tool.name}`}
                    >
                      <span className="icon">edit</span>
                    </button>
                    <button
                      onClick={() => removeTool(tool.name)}
                      disabled={connected}
                      aria-label={`Delete ${tool.name}`}
                    >
                      <span className="icon">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addTool}
              className="add-tool-button"
              disabled={connected}
            >
              <span className="icon">add</span> Add function call
            </button>
          </div>
        </div>
      </aside>
      {editingTool && (
        <ToolEditorModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={handleSaveTool}
        />
      )}
    </>
  );
}
