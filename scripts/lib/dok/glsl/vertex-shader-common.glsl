vec3 rotateVectorByQuaternion( in vec3 v, in vec4 q ) {

    vec3 dest = vec3( 0.0 );

    float x = v.x, y  = v.y, z  = v.z;
    float qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quaternion * vector

    float ix =  qw * x + qy * z - qz * y,
          iy =  qw * y + qz * x - qx * z,
          iz =  qw * z + qx * y - qy * x,
          iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quaternion

    dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return dest;

}

vec4 axisAngleToQuaternion( in vec3 axis, in float angle ) {

    vec4 dest = vec4( 0.0 );

    float halfAngle = angle / 2.0,
          s = sin( halfAngle );

    dest.x = axis.x * s;
    dest.y = axis.y * s;
    dest.z = axis.z * s;
    dest.w = cos( halfAngle );

    return dest;

}
