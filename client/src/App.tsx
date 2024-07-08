import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
    const webSocket = useRef<WebSocket | null>(null);
    const sendSocket = (RGB : string, x : number, y : number, size : number, timestamp : number) => {
        if(webSocket.current?.readyState === WebSocket.OPEN) {
            const param = {
                "RGB" : RGB,
                "location" : x + "," + y,
                "writer" : "admin",
                "brashSize" : size,
                "timestamp" : timestamp
            };
            webSocket.current.send(JSON.stringify(param));
        }
    };

    useEffect(() =>{
        webSocket.current = new WebSocket(process.env.REACT_APP_URL!);
        webSocket.current.onopen = (data) => {
            console.log('WebSocket 연결!');
        };
        webSocket.current.onclose = (error) => {
            console.log(error);
        }
        webSocket.current.onerror = (error) => {
            console.log(error);
        }
        webSocket.current.onmessage = (event: MessageEvent) => {   
            const pixelData = JSON.parse(event.data);
            const [pointX, pointY] = pixelData.location.split(',')

            // 다른 캠버스로 그리기
            const canvas : any = document.getElementById("bob");
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = pixelData.RGB;
            ctx.fillRect(pointX, pointY, pixelData.brashSize, pixelData.brashSize);
        };

        return () => {
            webSocket.current?.close();
        };
    }, [])

    const [color, setColor] = useState("#000000")
    const [brashSize, setBrashSize] = useState(3);

    let pointX = -1;
    let pointY = -1;
    let prvPoint = [-1, -1];

    // 색 변경 적용
    const colorChange = (e : any) => {
        setColor(e.target.value);
    }

    const brashChange = (e : any) => {
        setBrashSize(e.currentTarget.value)
    }

    // 캔버스 그리기 
    const draw = (e : any) => {
        // TODO : 어느 캔버스에 입력하든 websocket 적용하기 (오류 해결하기 -> 색상 변경 후 먹히지 않음)
        const canvas : any = document.getElementById("alice");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;

        pointX = Math.floor((e.target.width * e.clientX) / e.target.clientWidth) - e.target.offsetLeft
        pointY = Math.floor((e.target.height * e.clientY) / e.target.clientHeight) - e.target.offsetTop

        let [x0, y0] = prvPoint;
        if(prvPoint[0] < 0) {
            [x0, y0] = [pointX, pointY]
        }

        const dx = pointX - x0;
        const dy = pointY - y0;
    
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const xinc = dx / steps,
          yinc = dy / steps;
    
        for (let i = 0; i < steps; i++) {
          x0 += xinc;
          y0 += yinc;
          const x1 = Math.round(x0);
          const y1 = Math.round(y0);
    
          ctx.fillRect(x1, y1, brashSize, brashSize);
          sendSocket(color, x1, y1, brashSize, 1);
        }

        ctx.fillRect(pointX, pointY, brashSize, brashSize);
        prvPoint = [pointX, pointY]
        sendSocket(color, pointX, pointY, brashSize, 1);
    }

    // 캔버스 이동하기
    const drawMove = (e : any) => {
        if(prvPoint[0] >= 0 && prvPoint[1] >= 0) {
            draw(e)
        }
    }

    // 캔버스 포인터 떼기 
    const drawUp = (e : any) => {
        prvPoint = [-1, -1];
    }

  return (
    <>
        <div className = "artEditorTitle">
            <h1>Title</h1> 
        </div>
        <div className = "artEditorTool">
            <p className="colorSpan">색 선택 : </p>
            <input className="color colorSpan" type="color" value={color} onChange={colorChange}/>
            <p className="colorSpan">크기 선택 : </p>
            <label>
                <select name="brashSize" value={brashSize} onChange={brashChange}>
                    <option value="5">큼</option>
                    <option value="3">보통</option>
                    <option value="1">작음</option>
                </select>
            </label>
        </div>
        <div className = "artEditorMain">
            <div className="wrapper">
                <div className="canvases">
                    <canvas className="canvas" 
                            id="alice" 
                            height="428"
                            width="428"
                            onPointerDown={draw}
                            onPointerMove={drawMove}
                            onPointerUp={drawUp}>
                    </canvas>
                    <canvas className="canvas" 
                            id="bob"
                            height="428"
                            width="428"
                            onPointerDown={draw}
                            onPointerMove={drawMove}
                            onPointerUp={drawUp}>
                    </canvas>
                </div>
            </div>
        </div>
    </>
  );
}

export default App;
