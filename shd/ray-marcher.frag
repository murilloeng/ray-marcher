#version 460 core

uniform int width;
uniform int height;

uniform float focal_length;
uniform vec4 camera_rotation;
uniform vec3 camera_position;

out vec4 fragment_color;

#define march_steps 100
#define march_min 1.00e-05
#define march_max 1.00e+30
#define march_normal 1.00e-02

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

float sdf(vec3 point)
{
	//objects
	Sphere sphere_1 = Sphere(vec3(0, 0, 1), vec3(+0, +0, 20), 5);
	Sphere sphere_2 = Sphere(vec3(0, 0, 1), vec3(-10, +0, 20), 5);
	Sphere sphere_3 = Sphere(vec3(0, 0, 1), vec3(+10, +0, 20), 5);
	Sphere sphere_4 = Sphere(vec3(0, 0, 1), vec3(+0, -10, 20), 5);
	Sphere sphere_5 = Sphere(vec3(0, 0, 1), vec3(+0, +10, 20), 5);
	Plane plane = Plane(vec3(0, 0, 1), vec3(0, -2, 0), vec3(0, 0, 1));
	//distance
	float sdf = march_max;
	sdf = min(sdf, sdf_sphere(point, sphere_1));
	sdf = min(sdf, sdf_sphere(point, sphere_2));
	sdf = min(sdf, sdf_sphere(point, sphere_3));
	sdf = min(sdf, sdf_sphere(point, sphere_4));
	sdf = min(sdf, sdf_sphere(point, sphere_5));
	//return
	return sdf;
}
vec3 compute_normal(vec3 p)
{
	vec2 d = vec2(march_normal, 0.0);
	float gx = sdf(p + d.xyy) - sdf(p - d.xyy);
	float gy = sdf(p + d.yxy) - sdf(p - d.yxy);
	float gz = sdf(p + d.yyx) - sdf(p - d.yyx);
	return normalize(vec3(gx, gy, gz));
}

vec3 ray_march(vec3 ro, vec3 rd)
{
	//data
	float s = 0, ds;
	//search
	for(uint i = 0; i < march_steps; i++)
	{
		//check
		ds = sdf(ro + s * rd);
		if(ds < march_min)
		{
			vec3 p = ro + s * rd;
			vec3 normal = compute_normal(p);
			// part 2.2 - add lighting

			// part 2.2.1 - calculate diffuse lighting
			vec3 lightColor = vec3(1.0);
			vec3 lightSource = vec3(0, 0, -1.0);
			float diffuseStrength = max(0.0, dot(normalize(lightSource), normal));
			vec3 diffuse = lightColor * diffuseStrength;

			// part 2.2.2 - calculate specular lighting
			vec3 viewSource = normalize(ro);
			vec3 reflectSource = normalize(reflect(-lightSource, normal));
			float specularStrength = max(0.0, dot(viewSource, reflectSource));
			specularStrength = pow(specularStrength, 64.0);
			vec3 specular = specularStrength * lightColor;

			// part 2.2.3 - calculate lighting
			vec3 lighting = diffuse * 0.75 + specular * 0.25;
			vec3 color = lighting;

			// note: add gamma correction
			color = pow(color, vec3(1.0 / 2.2));
			return color;
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