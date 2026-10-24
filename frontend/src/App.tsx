import { useCallback, useState } from "react";
import { ChatContainer } from "./components/ChatContainer";
import { ChatInput } from "./components/ChatInput";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import { useChat } from "./hooks/useChat";
import { useSettings } from "./hooks/useSettings";

function isMobileViewport() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

export default function App() {
  const chat = useChat();
  const settings = useSettings();

  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const closeSidebarOnMobile = useCallback(() => {
    if (isMobileViewport()) setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    chat.newChat();
    closeSidebarOnMobile();
  }, [chat, closeSidebarOnMobile]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      chat.selectConversation(id);
      closeSidebarOnMobile();
    },
    [chat, closeSidebarOnMobile],
  );

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={chat.conversations}
        currentId={chat.currentId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onOpenSettings={handleOpenSettings}
        onOpenAbout={handleOpenSettings}
        onToggleTheme={settings.toggleTheme}
        resolvedTheme={settings.resolvedTheme}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onNewChat={handleNewChat}
          onToggleTheme={settings.toggleTheme}
          resolvedTheme={settings.resolvedTheme}
        />

        <ChatContainer
          messages={chat.messages}
          isLoading={chat.isLoading}
          error={chat.error}
          showSources={settings.showSources}
          onRegenerate={chat.regenerate}
          onRetry={chat.retry}
          onSuggest={chat.send}
        />

        <ChatInput
          onSend={chat.send}
          onStop={chat.stop}
          isLoading={chat.isLoading}
          enterToSend={settings.enterToSend}
        />
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={settings.theme}
        onThemeChange={settings.setTheme}
        enterToSend={settings.enterToSend}
        onEnterToSendChange={settings.setEnterToSend}
        showSources={settings.showSources}
        onShowSourcesChange={settings.setShowSources}
      />
    </div>
  );
}
