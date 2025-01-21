#version 460 core

uniform int time;
uniform int width;
uniform int height;

uniform float focal_length;
uniform vec4 camera_rotation;
uniform vec3 camera_position;

out vec4 fragment_color;

const int march_steps = 100;
const float march_min = 1.00e-05;
const float march_max = 1.00e+30;
const float march_normal = 1.00e-02;

const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_source = vec3(0.0, 1.0, 0.0);
const vec3 light_ambient = vec3(0.01, 0.01, 0.01);

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
	//data
	float t = float(time) / 1e3;
	float sdf = march_max, sdf_object;
	Sphere sphere_1 = Sphere(vec3(1, 0, 0), vec3(+0, +0, 20), 5);
	Sphere sphere_2 = Sphere(vec3(0, 1, 0), vec3(-10 * cos(t), +0, 20 + 10 * sin(t)), 5);
	Sphere sphere_3 = Sphere(vec3(0, 1, 0), vec3(+10 * cos(t), +0, 20 - 10 * sin(t)), 5);
	Sphere sphere_4 = Sphere(vec3(0, 0, 1), vec3(+10 * sin(t), -10 * cos(t), 20), 5);
	Sphere sphere_5 = Sphere(vec3(0, 0, 1), vec3(-10 * sin(t), +10 * cos(t), 20), 5);
	Plane plane = Plane(vec3(1, 1, 0), vec3(0, -15, 0), vec3(0, 1, 0));
	//plane
	sdf_object = sdf_plane(point, plane);
	if(sdf > sdf_object) {sdf = sdf_object; color = plane.m_color;}
	//sphere 1
	sdf_object = sdf_sphere(point, sphere_1);
	if(sdf > sdf_object) {sdf = sdf_object; color = sphere_1.m_color;}
	//sphere 2
	sdf_object = sdf_sphere(point, sphere_2);
	if(sdf > sdf_object) {sdf = sdf_object; color = sphere_2.m_color;}
	//sphere 3
	sdf_object = sdf_sphere(point, sphere_3);
	if(sdf > sdf_object) {sdf = sdf_object; color = sphere_3.m_color;}
	//sphere 4
	sdf_object = sdf_sphere(point, sphere_4);
	if(sdf > sdf_object) {sdf = sdf_object; color = sphere_4.m_color;}
	//sphere 5
	sdf_object = sdf_sphere(point, sphere_5);
	if(sdf > sdf_object) {sdf = sdf_object; color = sphere_5.m_color;}
	//return
	return sdf;
}
vec3 compute_normal(vec3 p)
{
	vec3 color;
	vec2 d = vec2(march_normal, 0.0);
	float gx = sdf(p + d.xyy, color) - sdf(p - d.xyy, color);
	float gy = sdf(p + d.yxy, color) - sdf(p - d.yxy, color);
	float gz = sdf(p + d.yyx, color) - sdf(p - d.yyx, color);
	return normalize(vec3(gx, gy, gz));
}

vec3 ray_march(vec3 ro, vec3 rd)
{
	//data
	float s = 0, ds;
	vec3 object_color;
	//search
	for(uint i = 0; i < march_steps; i++)
	{
		ds = sdf(ro + s * rd, object_color);
		if(ds < march_min)
		{
			vec3 p = ro + s * rd;
			vec3 normal = compute_normal(p);
			// part 2.2 - add lighting

			// part 2.2.1 - calculate diffuse lighting
			float diffuse_strength = max(0.0, dot(normalize(light_source), normal));
			vec3 diffuse = diffuse_strength * light_color * object_color;

			// part 2.2.2 - calculate specular lighting
			vec3 view_source = normalize(ro);
			vec3 reflect_source = normalize(reflect(-light_source, normal));
			float specular_strength = pow(max(0.0, dot(view_source, reflect_source)), 64.0);
			vec3 specular = specular_strength * light_color * object_color;

			// part 2.2.3 - calculate lighting
			vec3 lighting = diffuse * 0.75 + specular * 0.25 + light_ambient * object_color;

			// note: add gamma correction
			lighting = pow(lighting, vec3(1.0 / 2.2));
			return lighting;
		}
		//update
		s += ds;
		if(s > march_max) return vec3(0);
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
	const vec3 ray_direction = normalize(vec3(x1, x2, focal_length));
	//fragment
	fragment_color = vec4(ray_march(camera_position, ray_direction), 1);
}