#version 460 core

uniform int width;
uniform int height;

uniform float focal_length;
uniform vec4 camera_rotation;
uniform vec3 camera_position;

out vec4 fragment_color;

struct Box
{
	vec3 m_color;
	vec3 m_sizes;
	vec3 m_center;
};
struct Plane
{
	vec3 m_color;
	vec3 m_center;
	vec3 m_normal;
};
struct Sphere
{
	vec3 m_color;
	vec3 m_center;
	float m_radius;
};

uint n_boxes;
uint n_planes;
uint n_spheres;

Box boxes[100];
Plane planes[100];
Sphere spheres[100];


float sdf_box(vec3 point, Box box)
{
	vec3 q = abs(point - box.m_center) - box.m_sizes / 2;
	return length(max(q, 0)) + min(max(q.x, max(q.y, q.z)), 0);
}
float sdf_plane(vec3 point, Plane plane)
{
	return dot(point - plane.m_center, plane.m_normal);
}
float sdf_sphere(vec3 point, Sphere sphere)
{
	return length(point - sphere.m_center) - sphere.m_radius;
}

float sdf(vec3 point, out vec3 color)
{
	float sdf = 1e30, sdf_object;
	for(uint i = 0; i < n_boxes; i++)
	{
		sdf_object = sdf_box(point, boxes[i]);
		if(abs(sdf_object) < sdf)
		{
			sdf = sdf_object;
			color = boxes[i].m_color;
		}
	}
	for(uint i = 0; i < n_planes; i++)
	{
		sdf_object = sdf_plane(point, planes[i]);
		if(abs(sdf_object) < sdf)
		{
			sdf = sdf_object;
			color = planes[i].m_color;
		}
	}
	for(uint i = 0; i < n_spheres; i++)
	{
		sdf_object = sdf_sphere(point, spheres[i]);
		if(abs(sdf_object) < sdf)
		{
			sdf = sdf_object;
			color = spheres[i].m_color;
		}
	}
	return sdf;
}

void scene(void)
{
	//sizes
	n_boxes = 0;
	n_planes = 1;
	n_spheres = 0;
	//spheres
	float t = 0.001 * 3.1416 / 180;
	spheres[0] = Sphere(vec3(1, 0, 0), vec3(0, 0, -5), 3);
	boxes[0] = Box(vec3(0, 0, 1), vec3(0, 0, -3), vec3(5, 5, 5));
	planes[0] = Plane(vec3(0, 1, 0), vec3(0, 0, -5), vec3(0, cos(t), sin(t)));
}

vec3 ray_color(vec3 ray_direction)
{
	//data
	vec3 color;
	float s = 0, ds;
	//search
	for(uint i = 0; i < 100; i++)
	{
		ds = sdf(camera_position + s * ray_direction, color);
		if(ds < 1e-5)
		{
			return color;
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
	const vec3 ray_direction = normalize(vec3(x1, x2, -focal_length));
	//fragment
	scene();
	fragment_color = vec4(ray_color(ray_direction), 1);
}