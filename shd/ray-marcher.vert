#version 460 core

layout (location = 0) in vec2 position;

void main(void)
{
	gl_Position = vec4(position, -1, 1);
}