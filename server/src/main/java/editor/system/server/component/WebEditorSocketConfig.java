package editor.system.server.component;

import editor.system.server.websocket.WebEditorSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@RequiredArgsConstructor
@Configuration
@EnableWebSocket
public class WebEditorSocketConfig implements WebSocketConfigurer {
    private final WebEditorSocketHandler webEditorSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webEditorSocketHandler, "/socket").setAllowedOrigins("*");
    }
}