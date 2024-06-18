#version 460 core

uniform int width;
uniform int height;

uniform float focal_length;
uniform vec4 camera_rotation;
uniform vec3 camera_position;

out vec4 fragment_color;

struct Sphere
{
	vec3 m_color;
	vec3 m_center;
	float m_radius;
};

vec3 quat_rotation(vec4 q, vec3 v)
{
	const vec3 x = q.yzw;
	const float s = q[0];
	const float b = 2 * dot(x, v);
	const float a = s * s - dot(x, x);
	return a * v + b * x + 2 * s * cross(x, v);
}

float sdf_sphere(Sphere sphere, vec3 point)
{
	return length(point - sphere.m_center) - sphere.m_radius;
}

vec3 ray_color(vec3 ray_direction)
{
	//data
	float s = 0, ds;
	Sphere sphere = Sphere(vec3(1, 0, 1), vec3(0, 0, -5), 3);
	//iterations
	for(uint i = 0; i < 100; i++)
	{
		ds = sdf_sphere(sphere, camera_position + s * ray_direction);
		if(ds < 1e-5)
		{
			return sphere.m_color;
		}
		s += ds;
		if(s > 1e5)
		{
			return vec3(0);
		}
	}
	//return
	return vec3(0);
}

void main(void)
{
	//data
	const float w = width;
	const float h = height;
	const float m = min(w, h);
	const float x1 = 2 * gl_FragCoord[0] / m - w / m;
	const float x2 = 2 * gl_FragCoord[1] / m - h / m;
	const vec3 ray_direction = quat_rotation(camera_rotation, normalize(vec3(x1, x2, -focal_length)));
	//fragment
	fragment_color = vec4(ray_color(ray_direction), 1);
}