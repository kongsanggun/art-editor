package editor.system.server.dto;

import editor.system.server.service.EditorService;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
public class EditorDto {
    private String editorId;
    private Set<WebSocketSession> sessions = new HashSet<>();
    private Map<String, String> pixels = new HashMap<>();

    @Builder
    public EditorDto(String editorId) {
        this.editorId = editorId;
    }
}