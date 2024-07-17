const vertexShaderSource = `
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float u_time;
uniform vec2 u_lightPosition;
uniform float u_shininess;

void main() {
    vec2 st = gl_FragCoord.xy / vec2(1500.0);
    vec3 normal = vec3(0.0, 0.0, 1.0); // Assume a simple normal pointing out of the screen

    vec3 lightPos = vec3(u_lightPosition, 1.0);
    vec3 lightDir = normalize(lightPos - vec3(st, 0.0));

    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); // Assume the viewer is directly in front of the screen
    vec3 halfDir = normalize(lightDir + viewDir);

    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, halfDir), 0.0), u_shininess);

    vec3 baseColor = vec3(0.5 + 0.5 * cos(u_time + st.xyx * 10.0 + vec3(0, 2, 4)));
    vec3 diffuse = baseColor * diff;
    vec3 specular = vec3(1.0) * spec; // Ks is white

    vec3 color = diffuse + specular;

    gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking failed: ', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function main() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
    const lightPositionUniformLocation = gl.getUniformLocation(program, 'u_lightPosition');
    const shininessUniformLocation = gl.getUniformLocation(program, 'u_shininess');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let lightPosition = { x: -1.0, y: -1.0 }; // Start with the light off-canvas
    let shininess = 100.0;

    function render(time) {
        time *= 0.001; // convert time to seconds

        resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(timeUniformLocation, time);
        gl.uniform2f(lightPositionUniformLocation, lightPosition.x, lightPosition.y);
        gl.uniform1f(shininessUniformLocation, shininess);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('controls-container');
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.top = '370px';
    controlsContainer.style.left = '10px';
    controlsContainer.style.padding = '12px';
    document.body.appendChild(controlsContainer);

    const shininessLabel = document.createElement('label');
    shininessLabel.textContent = 'Shininess';
    controlsContainer.appendChild(shininessLabel);

    const shininessSlider = document.createElement('input');
    shininessSlider.type = 'range';
    shininessSlider.min = '1';
    shininessSlider.max = '100';
    shininessSlider.value = shininess;
    shininessSlider.style.display = 'block';
    shininessSlider.style.width = '100px';
    controlsContainer.appendChild(shininessSlider);

    shininessSlider.addEventListener('input', (event) => {
        shininess = parseFloat(event.target.value);
    });

    const lightXLabel = document.createElement('label');
    lightXLabel.textContent = 'Light X';
    controlsContainer.appendChild(lightXLabel);

    const lightXSlider = document.createElement('input');
    lightXSlider.type = 'range';
    lightXSlider.min = '0';
    lightXSlider.max = '1';
    lightXSlider.step = '0.01';
    lightXSlider.value = lightPosition.x;
    lightXSlider.style.display = 'block';
    lightXSlider.style.width = '100px';
    controlsContainer.appendChild(lightXSlider);

    const lightYLabel = document.createElement('label');
    lightYLabel.textContent = 'Light Y';
    controlsContainer.appendChild(lightYLabel);

    const lightYSlider = document.createElement('input');
    lightYSlider.type = 'range';
    lightYSlider.min = '0';
    lightYSlider.max = '1';
    lightYSlider.step = '0.01';
    lightYSlider.value = lightPosition.y;
    lightYSlider.style.display = 'block';
    lightYSlider.style.width = '100px';
    controlsContainer.appendChild(lightYSlider);

    lightXSlider.addEventListener('input', (event) => {
        lightPosition.x = parseFloat(event.target.value);
    });

    lightYSlider.addEventListener('input', (event) => {
        lightPosition.y = parseFloat(event.target.value);
    });

    requestAnimationFrame(render);
}

main();
