import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { Editor } from './components/Editor';
import { Explorer } from './components/Explorer';
import { Terminal } from './components/Terminal';
import { Toolbar } from './components/Toolbar';
import { PromptScreen } from './components/PromptScreen';
import { Preview } from './components/Preview';

function App() {
  const { theme, promptScreen, activeTab } = useAppStore();

  return (
    <AnimatePresence>
      {promptScreen ? (
        <PromptScreen />
      ) : (
        <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
          <Toolbar />
          <div className="flex-1 flex overflow-hidden">
            <Explorer />
            {activeTab === 'code' ? <Editor /> : <Preview />}
          </div>
          <Terminal />
        </div>
      )}
    </AnimatePresence>
  );
}

export default App;