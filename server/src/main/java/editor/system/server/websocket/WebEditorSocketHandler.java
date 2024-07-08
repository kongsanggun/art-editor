package editor.system.server.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import editor.system.server.dto.EditorDto;
import editor.system.server.service.EditorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Component
public class WebEditorSocketHandler implements WebSocketHandler {

    private Map<String, EditorDto> editorRooms = new HashMap<>();
    private String randomId = UUID.randomUUID().toString();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("Hi chat~");

        // 에디터 세션 리스트 생성 (처음 서버 접속 시)
        if(!editorRooms.containsKey(randomId)){
            editorRooms.put(randomId, new EditorDto(randomId));
        }

        // 접속자 추가
        EditorDto editor = editorRooms.get(randomId);
        editor.getSessions().add(session);

        // 정보 불러오기
        editor.getPixels().forEach((strKey, strValue)->{
            TextMessage textMessage = new TextMessage(strValue);
            try {
                session.sendMessage(textMessage);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        Map payloadObject = getPayloadObject(payload);
        EditorDto editor = editorRooms.get(randomId);

        // 정보를 저장한다.
        editor.getPixels().put(payloadObject.get("location").toString(), payload);

        // 같은 방에 있는 사람에게만 보낸다.
        for(WebSocketSession editorSession : editor.getSessions()) {
            TextMessage textMessage = new TextMessage(payload);
            editorSession.sendMessage(textMessage);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {}

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.info("Bye chat...");

        // 닫을 때 에디터 내 세션 리스트 삭제
        EditorDto editor = editorRooms.get(randomId);
        editor.getSessions().remove(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    private Map getPayloadObject(String payload) {
        JsonParser parser = new JsonParser();
        JsonObject obj = (JsonObject)parser.parse(payload);

        Gson gson = new Gson();
        Map result = new HashMap();
        result = (Map) gson.fromJson(obj, result.getClass());

        return result;
    }
}