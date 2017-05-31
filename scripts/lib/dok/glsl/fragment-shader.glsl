uniform sampler2D texture[ 16 ];
varying vec2 vUv;
varying float vTex;
varying float vLight;

void main() {
    vec2 uv = vUv;

    int iTex = int(vTex);

    if(iTex==0) {
        gl_FragColor = texture2D( texture[0],  uv);
    } else if(iTex==1) {
        gl_FragColor = texture2D( texture[1],  uv);
    } else if(iTex==2) {
        gl_FragColor = texture2D( texture[2],  uv);
    } else if(iTex==3) {
        gl_FragColor = texture2D( texture[3],  uv);
    } else if(iTex==4) {
        gl_FragColor = texture2D( texture[4],  uv);
    } else if(iTex==5) {
        gl_FragColor = texture2D( texture[5],  uv);
    } else if(iTex==6) {
        gl_FragColor = texture2D( texture[6],  uv);
    } else if(iTex==7) {
        gl_FragColor = texture2D( texture[7],  uv);
    } else if(iTex==8) {
        gl_FragColor = texture2D( texture[8],  uv);
    } else if(iTex==9) {
        gl_FragColor = texture2D( texture[9],  uv);
    } else if(iTex==10) {
        gl_FragColor = texture2D( texture[10],  uv);
    } else if(iTex==11) {
        gl_FragColor = texture2D( texture[11],  uv);
    } else if(iTex==12) {
        gl_FragColor = texture2D( texture[12],  uv);
    } else if(iTex==13) {
        gl_FragColor = texture2D( texture[13],  uv);
    } else if(iTex==14) {
        gl_FragColor = texture2D( texture[14],  uv);
    } else if(iTex==15) {
        gl_FragColor = texture2D( texture[15],  uv);
    }

    gl_FragColor.x *= vLight;
    gl_FragColor.y *= vLight;
    gl_FragColor.z *= vLight;
//        gl_FragColor.w *= vLight;
//    gl_FragColor.w = .5;
}