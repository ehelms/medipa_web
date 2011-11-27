/*
 * Copyright (c) 2011 Anatomical Travelogue LLC. All rights reserved.
 * (http://www.anatomicaltravel.com/research)
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *  - Redistributions of source code must retain the above copyright 
 *    notice, this list of conditions and the following disclaimer.
 *  - Redistributions in binary form must reproduce the above copyright 
 *    notice, this list of conditions and the following disclaimer in the 
 *    documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY ANATOMICAL TRAVELOGUE LLC ``AS IS'' AND 
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR 
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL ANATOMICAL TRAVELOGUE LLC 
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR 
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, 
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
var voltex_vShaderBack = '' +
'uniform mat4 u_modelViewProjMatrix;' +
'attribute vec3 vPosition;' +
'varying vec3 v_PosLocal;' +
'void main()' +
'{' +
'	v_PosLocal = vPosition;' +
'	gl_Position = u_modelViewProjMatrix * vec4(vPosition, 1.0);' +
'}';

var voltex_fShaderBack = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'varying vec3 v_PosLocal;' +
'void main()' +
'{' +
'	gl_FragColor = vec4(v_PosLocal, 1.0);' +
'}';

var voltex_vShaderFront = '' +
'uniform mat4 u_modelViewProjMatrix;' +
'attribute vec3 vPosition;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'void main()' +
'{' +
'	v_PosLocal = vPosition;' +
'	v_Position = u_modelViewProjMatrix * vec4(vPosition, 1.0);' +
'	gl_Position = v_Position;' +
'}';

var voltex_fShaderFront = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	float zpos = floor(pos_in.z * (texdim.z - 1.0) + 0.5); \n' +
'	vec2 texcoords = vec2((pos_in.x * (texdim.x - 1.0) + 0.5) / texdim.x / texcols, - (pos_in.y * (texdim.y - 1.0) + 0.5) / texdim.y / texrows);' +
'	return texture2D(volume_tex, vec2(fract(zpos / texcols), 1.0 - floor(zpos / texcols) / texrows) + texcoords); \n' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex, texcoords), clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity; \n' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	gl_FragColor = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'}';

var voltex_fShaderFrontLinear = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	vec3 pos = vec3(pos_in.x * (texdim.x - 1.0), pos_in.y * (texdim.y - 1.0), pos_in.z * (texdim.z - 1.0));' +
'	vec3 pos_low = vec3(floor(pos.x) + 0.5, floor(pos.y) + 0.5, floor(pos.z));' +
'	vec3 pos_high = vec3(ceil(pos.x) + 0.5, ceil(pos.y) + 0.5, ceil(pos.z));' +
'	vec2 offset1 = vec2(fract(pos_low.z / texcols), 1.0 - floor(pos_low.z / texcols) / texrows);' +
'	vec2 offset2 = vec2(fract(pos_high.z / texcols), 1.0 - floor(pos_high.z / texcols) / texrows);' +
'	float factorX = 1.0 / texdim.x / texcols;' +
'	float factorY = 1.0 / texdim.y / texrows;' +
'	vec2 texcoords1 = offset1 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords2 = offset1 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords3 = offset1 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords4 = offset1 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords5 = offset2 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords6 = offset2 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords7 = offset2 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords8 = offset2 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	float weightX = pos.x + 0.5 - pos_low.x;' +
'	float weightY = pos.y + 0.5 - pos_low.y;' +
'	vec4 color1 = mix(texture2D(volume_tex, texcoords1), texture2D(volume_tex, texcoords2), weightX);' +
'	vec4 color2 = mix(texture2D(volume_tex, texcoords3), texture2D(volume_tex, texcoords4), weightX);' +
'	vec4 color3 = mix(texture2D(volume_tex, texcoords5), texture2D(volume_tex, texcoords6), weightX);' +
'	vec4 color4 = mix(texture2D(volume_tex, texcoords7), texture2D(volume_tex, texcoords8), weightX);' +
'	vec4 color5 = mix(color1, color2, weightY);' +
'	vec4 color6 = mix(color3, color4, weightY);' +
'	return mix(color5, color6, pos.z - pos_low.z);' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex, texcoords), clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity;' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	gl_FragColor = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'}';

var voltex_fShaderFrontHigh = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex_high;' +
'uniform sampler2D intermediate_tex_low;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	float zpos = floor(pos_in.z * (texdim.z - 1.0) + 0.5); \n' +
'	vec2 texcoords = vec2((pos_in.x * (texdim.x - 1.0) + 0.5) / texdim.x / texcols, - (pos_in.y * (texdim.y - 1.0) + 0.5) / texdim.y / texrows);' +
'	return texture2D(volume_tex, vec2(fract(zpos / texcols), 1.0 - floor(zpos / texcols) / texrows) + texcoords); \n' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex_high, texcoords) + texture2D(intermediate_tex_low, texcoords) / 255.0, clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity; \n' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	colorsum = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'	gl_FragColor = vec4(floor(colorsum.r * 255.0) / 255.0, floor(colorsum.g * 255.0) / 255.0, floor(colorsum.b * 255.0) / 255.0, floor(colorsum.a * 255.0) / 255.0);' +
'}';

var voltex_fShaderFrontLinearHigh = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex_high;' +
'uniform sampler2D intermediate_tex_low;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	vec3 pos = vec3(pos_in.x * (texdim.x - 1.0), pos_in.y * (texdim.y - 1.0), pos_in.z * (texdim.z - 1.0));' +
'	vec3 pos_low = vec3(floor(pos.x) + 0.5, floor(pos.y) + 0.5, floor(pos.z));' +
'	vec3 pos_high = vec3(ceil(pos.x) + 0.5, ceil(pos.y) + 0.5, ceil(pos.z));' +
'	vec2 offset1 = vec2(fract(pos_low.z / texcols), 1.0 - floor(pos_low.z / texcols) / texrows);' +
'	vec2 offset2 = vec2(fract(pos_high.z / texcols), 1.0 - floor(pos_high.z / texcols) / texrows);' +
'	float factorX = 1.0 / texdim.x / texcols;' +
'	float factorY = 1.0 / texdim.y / texrows;' +
'	vec2 texcoords1 = offset1 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords2 = offset1 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords3 = offset1 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords4 = offset1 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords5 = offset2 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords6 = offset2 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords7 = offset2 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords8 = offset2 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	float weightX = pos.x + 0.5 - pos_low.x;' +
'	float weightY = pos.y + 0.5 - pos_low.y;' +
'	vec4 color1 = mix(texture2D(volume_tex, texcoords1), texture2D(volume_tex, texcoords2), weightX);' +
'	vec4 color2 = mix(texture2D(volume_tex, texcoords3), texture2D(volume_tex, texcoords4), weightX);' +
'	vec4 color3 = mix(texture2D(volume_tex, texcoords5), texture2D(volume_tex, texcoords6), weightX);' +
'	vec4 color4 = mix(texture2D(volume_tex, texcoords7), texture2D(volume_tex, texcoords8), weightX);' +
'	vec4 color5 = mix(color1, color2, weightY);' +
'	vec4 color6 = mix(color3, color4, weightY);' +
'	return mix(color5, color6, pos.z - pos_low.z);' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex_high, texcoords) + texture2D(intermediate_tex_low, texcoords) / 255.0, clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity;' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	colorsum = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'	gl_FragColor = vec4(floor(colorsum.r * 255.0) / 255.0, floor(colorsum.g * 255.0) / 255.0, floor(colorsum.b * 255.0) / 255.0, floor(colorsum.a * 255.0) / 255.0);' +
'}';

var voltex_fShaderFrontLow = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex_high;' +
'uniform sampler2D intermediate_tex_low;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	float zpos = floor(pos_in.z * (texdim.z - 1.0) + 0.5); \n' +
'	vec2 texcoords = vec2((pos_in.x * (texdim.x - 1.0) + 0.5) / texdim.x / texcols, - (pos_in.y * (texdim.y - 1.0) + 0.5) / texdim.y / texrows);' +
'	return texture2D(volume_tex, vec2(fract(zpos / texcols), 1.0 - floor(zpos / texcols) / texrows) + texcoords); \n' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex_high, texcoords) + texture2D(intermediate_tex_low, texcoords) / 255.0, clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity; \n' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	colorsum = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'	gl_FragColor = vec4(fract(colorsum.r * 255.0), fract(colorsum.g * 255.0), fract(colorsum.b * 255.0), fract(colorsum.a * 255.0));' +
'}';

var voltex_fShaderFrontLinearLow = '' +
'#ifdef GL_ES \n' +
'	precision highp float; \n' +
'#endif \n' +
'uniform sampler2D volume_tex;' +
'uniform sampler2D backpos_tex;' +
'uniform sampler2D intermediate_tex_high;' +
'uniform sampler2D intermediate_tex_low;' +
'//tf_tex uniform sampler2D transferfunction_tex; \n' +
'uniform vec3 texdim;' +
'uniform float texcols;' +
'uniform float texrows;' +
'uniform float stepsize;' +
'uniform float interstep;' +
'uniform float finalstep;' +
'uniform float opacity;' +
'uniform float brightness;' +
'varying vec4 v_Position;' +
'varying vec3 v_PosLocal;' +
'const float steps = 1.0;' +
'vec4 tex3D(vec3 pos_in)' +
'{' +
'	vec3 pos = vec3(pos_in.x * (texdim.x - 1.0), pos_in.y * (texdim.y - 1.0), pos_in.z * (texdim.z - 1.0));' +
'	vec3 pos_low = vec3(floor(pos.x) + 0.5, floor(pos.y) + 0.5, floor(pos.z));' +
'	vec3 pos_high = vec3(ceil(pos.x) + 0.5, ceil(pos.y) + 0.5, ceil(pos.z));' +
'	vec2 offset1 = vec2(fract(pos_low.z / texcols), 1.0 - floor(pos_low.z / texcols) / texrows);' +
'	vec2 offset2 = vec2(fract(pos_high.z / texcols), 1.0 - floor(pos_high.z / texcols) / texrows);' +
'	float factorX = 1.0 / texdim.x / texcols;' +
'	float factorY = 1.0 / texdim.y / texrows;' +
'	vec2 texcoords1 = offset1 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords2 = offset1 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords3 = offset1 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords4 = offset1 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords5 = offset2 + vec2(pos_low.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords6 = offset2 + vec2(pos_high.x * factorX, - pos_low.y * factorY);' +
'	vec2 texcoords7 = offset2 + vec2(pos_low.x * factorX, - pos_high.y * factorY);' +
'	vec2 texcoords8 = offset2 + vec2(pos_high.x * factorX, - pos_high.y * factorY);' +
'	float weightX = pos.x + 0.5 - pos_low.x;' +
'	float weightY = pos.y + 0.5 - pos_low.y;' +
'	vec4 color1 = mix(texture2D(volume_tex, texcoords1), texture2D(volume_tex, texcoords2), weightX);' +
'	vec4 color2 = mix(texture2D(volume_tex, texcoords3), texture2D(volume_tex, texcoords4), weightX);' +
'	vec4 color3 = mix(texture2D(volume_tex, texcoords5), texture2D(volume_tex, texcoords6), weightX);' +
'	vec4 color4 = mix(texture2D(volume_tex, texcoords7), texture2D(volume_tex, texcoords8), weightX);' +
'	vec4 color5 = mix(color1, color2, weightY);' +
'	vec4 color6 = mix(color3, color4, weightY);' +
'	return mix(color5, color6, pos.z - pos_low.z);' +
'}' +
'void main()' +
'{' +
'	vec3 raystart = v_PosLocal;' +
'	vec2 texcoords = (v_Position.xy / v_Position.w + vec2(1.0, 1.0)) / 2.0;' +
'	vec3 rayend = texture2D(backpos_tex, texcoords).xyz;' +
'	vec3 raydir = rayend - raystart;' +
'	vec3 deltadir = normalize(raydir) * stepsize;' +
'	float len = length(raydir);' +
'	float deltadirlen = length(deltadir);' +
'	vec3 raypos = raystart + steps * interstep * deltadir;' +
'	float lengthsum = steps * interstep * deltadirlen;' +
'	vec4 colorsum = mix(vec4(0.0, 0.0, 0.0, 0.0), texture2D(intermediate_tex_high, texcoords) + texture2D(intermediate_tex_low, texcoords) / 255.0, clamp(interstep, 0.0, 1.0));' +
'	vec4 colorsample;' +
'	for (float i = 0.0; i < steps; i += 1.0)' +
'	{' +
'		if (lengthsum >= len || colorsum.a >= 1.0) break;' +
'		colorsample = tex3D(raypos); //texture3D(volume_tex, raypos); \n' +
'		//tf_calc colorsample = texture2D(transferfunction_tex, vec2(colorsample.x, 0.5)); \n' +
'		colorsample.a *= stepsize * opacity;' +
'		colorsum.rgb += colorsample.rgb * colorsample.a * (1.0 - colorsum.a);' +
'		colorsum.a += colorsample.a * (1.0 - colorsum.a);' +
'		raypos += deltadir;' +
'		lengthsum += deltadirlen;' +
'	}' +
'	colorsum = mix(colorsum, vec4(colorsum.rgb * clamp(colorsum.a, 0.0, 1.0) * brightness, 1.0), finalstep);' +
'	gl_FragColor = vec4(fract(colorsum.r * 255.0), fract(colorsum.g * 255.0), fract(colorsum.b * 255.0), fract(colorsum.a * 255.0));' +
'}';

function initVolumeTexture(glcontext, canvas, texFile, texWidth, texHeight, texDepth, texCols, texRows, raySteps, rayGroupSteps, transferFunction, floatTexture)
{
	if (!glcontext || !canvas || !texFile || !texWidth || !texHeight || !texDepth || !texCols || !texRows || !raySteps || 
			texWidth <= 0 || texHeight <= 0 || texDepth <= 0 || texCols <= 0 || texRows <= 0 || raySteps <= 0)
		return null;

	volumeTexture = new Object();

	volumeTexture.singleIntermediateTexture = true;
	try
	{
		if (floatTexture) volumeTexture.extensionTextureFloat = glcontext.getExtension("OES_texture_float");
	}
	catch (e)
	{
		floatTexture = false;
		volumeTexture.singleIntermediateTexture = false;
	}

	// create frame buffer object for backface rendering
	volumeTexture.frameBufferBack = initVolumeTextureFBO(glcontext, canvas.width, canvas.height, floatTexture);
	if (!volumeTexture.frameBufferBack)
	{
		volumeTexture.singleIntermediateTexture = false;
		volumeTexture.frameBufferBack = initVolumeTextureFBO(glcontext, canvas.width, canvas.height);
	}
	if (!volumeTexture.frameBufferBack)
		return null;

	// create frame buffer objects for intermediate rendering
	if (volumeTexture.singleIntermediateTexture)
	{
		volumeTexture.frameBufferIntermediateA = initVolumeTextureFBO(glcontext, canvas.width, canvas.height, floatTexture);
		volumeTexture.frameBufferIntermediateB = initVolumeTextureFBO(glcontext, canvas.width, canvas.height, floatTexture);
		if (!volumeTexture.frameBufferIntermediateA || !volumeTexture.frameBufferIntermediateB)
			return null;
	}
	else
	{
		volumeTexture.frameBufferIntermediateAHigh = initVolumeTextureFBO(glcontext, canvas.width, canvas.height);
		volumeTexture.frameBufferIntermediateBHigh = initVolumeTextureFBO(glcontext, canvas.width, canvas.height);
		volumeTexture.frameBufferIntermediateALow = initVolumeTextureFBO(glcontext, canvas.width, canvas.height);
		volumeTexture.frameBufferIntermediateBLow = initVolumeTextureFBO(glcontext, canvas.width, canvas.height);
		if (!volumeTexture.frameBufferIntermediateAHigh || !volumeTexture.frameBufferIntermediateBHigh || !volumeTexture.frameBufferIntermediateALow || !volumeTexture.frameBufferIntermediateBLow)
			return null;
	}

	// create back and front face shaders for raycasting
	volumeTexture.shadersBack = initVolumeTextureShaders(glcontext, voltex_vShaderBack, voltex_fShaderBack, [ "vPosition" ]);
	if (!volumeTexture.shadersBack)
		return null;
	volumeTexture.shaderSteps = rayGroupSteps ? rayGroupSteps : raySteps;
	volumeTexture.shaderLoops = Math.ceil(raySteps * Math.sqrt(3.0) / volumeTexture.shaderSteps);
	if (volumeTexture.singleIntermediateTexture)
	{
		volumeTexture.shadersFront = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFront, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		volumeTexture.shadersFrontLinear = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFrontLinear, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		if (!volumeTexture.shadersFront || !volumeTexture.shadersFrontLinear)
			return null;
	}
	else
	{
		volumeTexture.shadersFrontHigh = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFrontHigh, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		volumeTexture.shadersFrontLinearHigh = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFrontLinearHigh, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		volumeTexture.shadersFrontLow = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFrontLow, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		volumeTexture.shadersFrontLinearLow = initVolumeTextureShaders(glcontext, voltex_vShaderFront, voltex_fShaderFrontLinearLow, [ "vPosition" ], volumeTexture.shaderSteps, transferFunction);
		if (!volumeTexture.shadersFrontHigh || !volumeTexture.shadersFrontLinearHigh || !volumeTexture.shadersFrontLow || !volumeTexture.shadersFrontLinearLow)
			return null;
	}

	// set uniform shader variables and texture image properties
	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.useProgram(volumeTexture.shadersFront);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFront, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFront, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFront, "intermediate_tex"), 2);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFront, "transferfunction_tex"), 3);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "brightness"), 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinear);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "intermediate_tex"), 2);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "transferfunction_tex"), 3);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "brightness"), 1.0);
	}
	else
	{
		glcontext.useProgram(volumeTexture.shadersFrontHigh);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "intermediate_tex_high"), 2);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "intermediate_tex_low"), 3);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "transferfunction_tex"), 4);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "brightness"), 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "intermediate_tex_high"), 2);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "intermediate_tex_low"), 3);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "transferfunction_tex"), 4);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "brightness"), 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLow);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "intermediate_tex_high"), 2);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "intermediate_tex_low"), 3);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "transferfunction_tex"), 4);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "brightness"), 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "volume_tex"), 0);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "backpos_tex"), 1);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "intermediate_tex_high"), 2);
		glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "intermediate_tex_low"), 3);
		if (transferFunction)
			glcontext.uniform1i(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "transferfunction_tex"), 4);
		glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texdim"), texWidth, texHeight, texDepth);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texcols"), texCols);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texrows"), texRows);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "stepsize"), 1.0 / raySteps);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "opacity"), 1.0);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "brightness"), 1.0);
	}

	// get location of model view projection matrices
	volumeTexture.shaderMatrixBack = glcontext.getUniformLocation(volumeTexture.shadersBack, "u_modelViewProjMatrix");
	if (volumeTexture.singleIntermediateTexture)
	{
		volumeTexture.shaderMatrixFront = glcontext.getUniformLocation(volumeTexture.shadersFront, "u_modelViewProjMatrix");
		volumeTexture.shaderMatrixFrontLinear = glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "u_modelViewProjMatrix");
	}
	else
	{
		volumeTexture.shaderMatrixFrontHigh = glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "u_modelViewProjMatrix");
		volumeTexture.shaderMatrixFrontLinearHigh = glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "u_modelViewProjMatrix");
		volumeTexture.shaderMatrixFrontLow = glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "u_modelViewProjMatrix");
		volumeTexture.shaderMatrixFrontLinearLow = glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "u_modelViewProjMatrix");
	}

	// load volume texture
	volumeTexture.mainTexture = loadVolumeTexture(glcontext, texFile, function(){});
	if (!volumeTexture.mainTexture)
		return null;

	// get a cube
	volumeTexture.cube = createVolumeTextureCube(glcontext, volumeTexture);

	// set vertex position array
	glcontext.enableVertexAttribArray(0);
	glcontext.bindBuffer(glcontext.ARRAY_BUFFER, volumeTexture.cube.vertexPositionBuffer);
	glcontext.vertexAttribPointer(0, volumeTexture.cube.vertexPositionDimension, glcontext.FLOAT, false, 0, 0);

	// bind vertex index array
	glcontext.bindBuffer(glcontext.ELEMENT_ARRAY_BUFFER, volumeTexture.cube.vertexIndexBuffer);

	return volumeTexture;
}

function setVolumeTexture(glcontext, volumeTexture, texFile, texWidth, texHeight, texDepth, texCols, texRows)
{
    
	if (!glcontext || !volumeTexture || !texFile || !texWidth || !texHeight || !texDepth || !texCols || !texRows || 
			texWidth <= 0 || texHeight <= 0 || texDepth <= 0 || texCols <= 0 || texRows <= 0)
		return;



    var callback = function(texture){
        if (volumeTexture.mainTexture)
            glcontext.deleteTexture(volumeTexture.mainTexture);
        
        if (!volumeTexture.mainTexture)
            return;
    
        if (volumeTexture.singleIntermediateTexture)
        {
            glcontext.useProgram(volumeTexture.shadersFront);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "texrows"), texRows);
            glcontext.useProgram(volumeTexture.shadersFrontLinear);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "texrows"), texRows);
        }
        else
        {
            glcontext.useProgram(volumeTexture.shadersFrontHigh);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "texrows"), texRows);
            glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "texrows"), texRows);
            glcontext.useProgram(volumeTexture.shadersFrontLow);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "texrows"), texRows);
            glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
            glcontext.uniform3f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texdim"), texWidth, texHeight, texDepth);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texcols"), texCols);
            glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "texrows"), texRows);
        }        
        volumeTexture.mainTexture = texture;
    };

	loadVolumeTexture(glcontext, texFile, callback);

}

function setVolumeTextureRaySteps(glcontext, volumeTexture, raySteps)
{
	if (!glcontext || !volumeTexture || !raySteps || raySteps <= 0)
		return;

	volumeTexture.shaderLoops = Math.ceil(raySteps * Math.sqrt(3.0) / volumeTexture.shaderSteps);

	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.useProgram(volumeTexture.shadersFront);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "stepsize"), 1.0 / raySteps);
		glcontext.useProgram(volumeTexture.shadersFrontLinear);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "stepsize"), 1.0 / raySteps);
	}
	else
	{
		glcontext.useProgram(volumeTexture.shadersFrontHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "stepsize"), 1.0 / raySteps);
		glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "stepsize"), 1.0 / raySteps);
		glcontext.useProgram(volumeTexture.shadersFrontLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "stepsize"), 1.0 / raySteps);
		glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "stepsize"), 1.0 / raySteps);
	}
}

function setVolumeTextureOpacity(glcontext, volumeTexture, opacity)
{
	if (!glcontext || !volumeTexture || !opacity || opacity <= 0)
		return;

	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.useProgram(volumeTexture.shadersFront);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "opacity"), opacity ? opacity : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinear);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "opacity"), opacity ? opacity : 1.0);
	}
	else
	{
		glcontext.useProgram(volumeTexture.shadersFrontHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "opacity"), opacity ? opacity : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "opacity"), opacity ? opacity : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "opacity"), opacity ? opacity : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "opacity"), opacity ? opacity : 1.0);
	}
}

function setVolumeTextureBrightness(glcontext, volumeTexture, brightness)
{
	if (!glcontext || !volumeTexture || !brightness || brightness <= 0)
		return;

	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.useProgram(volumeTexture.shadersFront);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "brightness"), brightness ? brightness : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinear);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "brightness"), brightness ? brightness : 1.0);
	}
	else
	{
		glcontext.useProgram(volumeTexture.shadersFrontHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "brightness"), brightness ? brightness : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "brightness"), brightness ? brightness : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "brightness"), brightness ? brightness : 1.0);
		glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
		glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "brightness"), brightness ? brightness : 1.0);
	}
}

function drawVolumeTexture(glcontext, volumeTexture, mvpMatrixArray, linearFiltering, transferFunction)
{
	if (!glcontext || !volumeTexture)
		return;

	if (transferFunction)
	{
		if (volumeTexture.transferFunction)
			glcontext.deleteTexture(volumeTexture.transferFunction);

		if (volumeTexture.singleIntermediateTexture)
			glcontext.activeTexture(glcontext.TEXTURE3);
		else
			glcontext.activeTexture(glcontext.TEXTURE4);
		volumeTexture.transferFunction = glcontext.createTexture();
		glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.transferFunction);
		glcontext.texImage2D(glcontext.TEXTURE_2D, 0, glcontext.RGBA, 256, 1, 0, glcontext.RGBA, glcontext.UNSIGNED_BYTE, transferFunction);
		glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_S, glcontext.CLAMP_TO_EDGE);
		glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_T, glcontext.CLAMP_TO_EDGE);
		glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MAG_FILTER, glcontext.LINEAR);
		glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MIN_FILTER, glcontext.LINEAR);
	}

	// disable blending and enable face culling
	glcontext.disable(glcontext.BLEND);
	glcontext.enable(glcontext.CULL_FACE);
	glcontext.frontFace(glcontext.CCW);

	// bind textures
	glcontext.activeTexture(glcontext.TEXTURE0);
	glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.mainTexture);
	glcontext.activeTexture(glcontext.TEXTURE1);
	glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferBack.tex);
	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.activeTexture(glcontext.TEXTURE2);
		glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateA.tex);
	}
	else
	{
		glcontext.activeTexture(glcontext.TEXTURE2);
		glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateAHigh.tex);
		glcontext.activeTexture(glcontext.TEXTURE3);
		glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateALow.tex);
	}

	// render back face buffer
	glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferBack);
	glcontext.cullFace(glcontext.FRONT);
	glcontext.useProgram(volumeTexture.shadersBack);
	if (mvpMatrixArray)
		glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixBack, false, mvpMatrixArray);
	glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT)
	glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);

	// render intermediate images
	if (volumeTexture.singleIntermediateTexture)
	{
		glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateA);
		glcontext.cullFace(glcontext.BACK);
		if (!linearFiltering)
		{
			glcontext.useProgram(volumeTexture.shadersFront);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFront, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFront, "finalstep"), 0);
		}
		else
		{
			glcontext.useProgram(volumeTexture.shadersFrontLinear);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFrontLinear, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinear, "finalstep"), 0);
		}
		glcontext.activeTexture(glcontext.TEXTURE2);
		for (var i = 0; i < volumeTexture.shaderLoops - 1; i++)
		{
			glcontext.uniform1f(glcontext.getUniformLocation(!linearFiltering ? volumeTexture.shadersFront : volumeTexture.shadersFrontLinear, "interstep"), i);
			glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT);
			glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);
			if (i % 2 == 0)
			{
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateB);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateA.tex);
			}
			else
			{
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateA);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateB.tex);
			}
		}

		// render final image
		glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, null);
		glcontext.uniform1f(glcontext.getUniformLocation(!linearFiltering ? volumeTexture.shadersFront : volumeTexture.shadersFrontLinear, "finalstep"), 1);
		glcontext.uniform1f(glcontext.getUniformLocation(!linearFiltering ? volumeTexture.shadersFront : volumeTexture.shadersFrontLinear, "interstep"), volumeTexture.shaderLoops - 1);
		glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT);
		glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);
	}
	else
	{
		glcontext.cullFace(glcontext.BACK);
		if (!linearFiltering)
		{
			glcontext.useProgram(volumeTexture.shadersFrontHigh);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFrontHigh, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "finalstep"), 0);
			glcontext.useProgram(volumeTexture.shadersFrontLow);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFrontLow, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "finalstep"), 0);
		}
		else
		{
			glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFrontLinearHigh, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "finalstep"), 0);
			glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
			if (mvpMatrixArray)
				glcontext.uniformMatrix4fv(volumeTexture.shaderMatrixFrontLinearLow, false, mvpMatrixArray);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "finalstep"), 0);
		}
		for (var i = 0; i < volumeTexture.shaderLoops - 1; i++)
		{
			if (i % 2 == 0)
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateAHigh);
			else
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateBHigh);
			if (!linearFiltering)
			{
				glcontext.useProgram(volumeTexture.shadersFrontHigh);
				glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "interstep"), i);
			}
			else
			{
				glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
				glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "interstep"), i);
			}
			glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT);
			glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);
			if (i % 2 == 0)
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateALow);
			else
				glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, volumeTexture.frameBufferIntermediateBLow);
			if (!linearFiltering)
			{
				glcontext.useProgram(volumeTexture.shadersFrontLow);
				glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLow, "interstep"), i);
			}
			else
			{
				glcontext.useProgram(volumeTexture.shadersFrontLinearLow);
				glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearLow, "interstep"), i);
			}
			glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT);
			glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);
			if (i % 2 == 0)
			{
				glcontext.activeTexture(glcontext.TEXTURE2);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateAHigh.tex);
				glcontext.activeTexture(glcontext.TEXTURE3);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateALow.tex);
			}
			else
			{
				glcontext.activeTexture(glcontext.TEXTURE2);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateBHigh.tex);
				glcontext.activeTexture(glcontext.TEXTURE3);
				glcontext.bindTexture(glcontext.TEXTURE_2D, volumeTexture.frameBufferIntermediateBLow.tex);
			}
		}

		// render final image
		glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, null);
		if (!linearFiltering)
		{
			glcontext.useProgram(volumeTexture.shadersFrontHigh);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "finalstep"), 1);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontHigh, "interstep"), volumeTexture.shaderLoops - 1);
		}
		else
		{
			glcontext.useProgram(volumeTexture.shadersFrontLinearHigh);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "finalstep"), 1);
			glcontext.uniform1f(glcontext.getUniformLocation(volumeTexture.shadersFrontLinearHigh, "interstep"), volumeTexture.shaderLoops - 1);
		}
		glcontext.clear(glcontext.COLOR_BUFFER_BIT | glcontext.DEPTH_BUFFER_BIT);
		glcontext.drawElements(glcontext.TRIANGLES, volumeTexture.cube.numberOfIndices, glcontext.UNSIGNED_BYTE, 0);
	}
}

function initVolumeTextureShaders(glcontext, vshader, fshader, attribs, raycastSteps, transferFunction)
{
	if (!glcontext || !vshader || !fshader)
		return null;

	if (raycastSteps && raycastSteps >= 1)
	{
		var steps = Number(raycastSteps);
		fshader = fshader.replace("const float steps = 1.0;", "const float steps = " + steps.toFixed(1) + ";");
	}

	if (transferFunction)
	{
		fshader = fshader.replace("//tf_tex", "");
		fshader = fshader.replace("//tf_calc", "");
	}

	var vertexShader = loadVolumeTextureShader(glcontext, vshader, glcontext.VERTEX_SHADER);
	var fragmentShader = loadVolumeTextureShader(glcontext, fshader, glcontext.FRAGMENT_SHADER, raycastSteps);
	if (!vertexShader || !fragmentShader)
		return null;

	var shaderProgram = glcontext.createProgram();
	if (!shaderProgram)
		return null;

	glcontext.attachShader(shaderProgram, vertexShader);
	glcontext.attachShader(shaderProgram, fragmentShader);

	for (var i = 0; i < attribs.length; ++i)
		glcontext.bindAttribLocation(shaderProgram, i, attribs[i]);

	glcontext.linkProgram(shaderProgram);
	var linked = glcontext.getProgramParameter(shaderProgram, glcontext.LINK_STATUS);
	if (!linked)
	{
		var error = glcontext.getProgramInfoLog(shaderProgram);
		glcontext.console.log("atvoltex: Unable to link program: " + error);
		glcontext.deleteProgram(shaderProgram);
		return null;
	}

	return shaderProgram;
}

function loadVolumeTextureShader(glcontext, shaderString, shaderType)
{
	if (!glcontext || !shaderString)
		return null;

	var shader = glcontext.createShader(shaderType);
	if (shader == null) {
		glcontext.console.log("atvoltex: Unable to create shader");
		return null;
	}

	glcontext.shaderSource(shader, shaderString);
	glcontext.compileShader(shader);

	var compiled = glcontext.getShaderParameter(shader, glcontext.COMPILE_STATUS);
	if (!compiled) {
		var error = glcontext.getShaderInfoLog(shader);
		glcontext.console.log("atvoltex: Unable to compile shader: " + error);
		glcontext.deleteShader(shader);
		return null;
	}

	return shader;
}

var jls = 0;


function testLoad(){
    var a = new Image();
    a.onload = function() {console.log("DONE")};
    a.src = "http://hodagri.com/MediaGallery/gallery/7/MMSposter-large.jpg";    
}
function loadVolumeTexture(glcontext, url, callback)
{
	if (!glcontext || !url)
		return null;


	var texture = glcontext.createTexture();
	texture.image = new Image();
	texture.image.onload = function()
	{
	    
	    
        if (jls === 1){
            return;
        }
                console.log('texture load callback');

	    callback(texture);
		handleVolumeTexture(glcontext, texture.image, texture)
	}
    console.log('setting src url');
    
    
	texture.image.src = url;
    console.log('source url set');
    //$("#hidden").html(texture.image);
	return texture;
}

function handleVolumeTexture(glcontext, image, texture)
{
	if (!glcontext || !image || !texture)
		return;

	glcontext.bindTexture(glcontext.TEXTURE_2D, texture);
	glcontext.texImage2D(glcontext.TEXTURE_2D, 0, glcontext.RGBA, glcontext.RGBA, glcontext.UNSIGNED_BYTE, image);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_S, glcontext.CLAMP_TO_EDGE);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_T, glcontext.CLAMP_TO_EDGE);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MAG_FILTER, glcontext.NEAREST);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MIN_FILTER, glcontext.NEAREST);
	glcontext.bindTexture(glcontext.TEXTURE_2D, null);
}

function initVolumeTextureFBO(glcontext, width, height, precision)
{
	if (!glcontext || !width || !height)
		return null;

	var fb = glcontext.createFramebuffer();
	glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, fb);

	fb.tex = glcontext.createTexture();
	glcontext.bindTexture(glcontext.TEXTURE_2D, fb.tex);
	if (precision)
		glcontext.texImage2D(glcontext.TEXTURE_2D, 0, glcontext.RGBA, width, height, 0, glcontext.RGBA, glcontext.FLOAT, new Float32Array(width * height * 4));
	else
		glcontext.texImage2D(glcontext.TEXTURE_2D, 0, glcontext.RGBA, width, height, 0, glcontext.RGBA, glcontext.UNSIGNED_BYTE, new Uint8Array(width * height * 4));
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_S, glcontext.CLAMP_TO_EDGE);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_WRAP_T, glcontext.CLAMP_TO_EDGE);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MAG_FILTER, glcontext.NEAREST);
	glcontext.texParameteri(glcontext.TEXTURE_2D, glcontext.TEXTURE_MIN_FILTER, glcontext.NEAREST);
	glcontext.bindTexture(glcontext.TEXTURE_2D, null);

	glcontext.framebufferTexture2D(glcontext.FRAMEBUFFER, glcontext.COLOR_ATTACHMENT0, glcontext.TEXTURE_2D, fb.tex, 0);
	if (glcontext.checkFramebufferStatus(glcontext.FRAMEBUFFER) != glcontext.FRAMEBUFFER_COMPLETE)
	{
		glcontext.console.log("atvoltex: Unable to create frame buffer");
		glcontext.deleteTexture(fb.tex);
		glcontext.deleteFramebuffer(fb);
		glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, null);
		return null;
	}
	glcontext.bindFramebuffer(glcontext.FRAMEBUFFER, null);

	return fb;
}

function createVolumeTextureCube(glcontext, object)
{
	if (!glcontext)
		return;

	var vertices = new Float32Array(
		[ 1, 1, 1,   0, 1, 1,   0, 0, 1,   1, 0, 1,
		  1, 0, 0,   1, 1, 0,   0, 1, 0,   0, 0, 0 ]
	);

	var indices = new Uint8Array(
		[ 0, 1, 2,   2, 3, 0,	// front
		  5, 0, 3,   3, 4, 5,	// right
		  6, 1, 0,   0, 5, 6,	// top
		  2, 1, 6,   6, 7, 2,	// left
		  3, 2, 7,   7, 4, 3,	// bottom
		  7, 6, 5,   5, 4, 7 ]	// back
	);

	object.vertexPositionBuffer = glcontext.createBuffer();
	glcontext.bindBuffer(glcontext.ARRAY_BUFFER, object.vertexPositionBuffer);
	glcontext.bufferData(glcontext.ARRAY_BUFFER, vertices, glcontext.STATIC_DRAW);
	glcontext.bindBuffer(glcontext.ARRAY_BUFFER, null);
	object.vertexPositionDimension = 3;

	object.vertexIndexBuffer = glcontext.createBuffer();
	glcontext.bindBuffer(glcontext.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);
	glcontext.bufferData(glcontext.ELEMENT_ARRAY_BUFFER, indices, glcontext.STATIC_DRAW);
	glcontext.bindBuffer(glcontext.ELEMENT_ARRAY_BUFFER, null);
	object.numberOfIndices = indices.length;

	return object;
}
