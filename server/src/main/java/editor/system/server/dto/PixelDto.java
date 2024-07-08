package editor.system.server.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PixelDto {
    private String RGB;
    private String brashSize;
    private String location;
    private String writer;
    private int timestamp;
}
