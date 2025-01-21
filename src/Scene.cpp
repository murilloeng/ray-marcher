//ray-marcher
#include "ray-marcher/inc/Scene.hpp"
#include "ray-marcher/inc/Shader.hpp"
#include "ray-marcher/inc/Program.hpp"

namespace ray_marcher
{
	//constructors
	Scene::Scene(void) : m_program(new Program)
	{
		setup_gl();
		setup_buffers();
		setup_shaders();
		setup_uniforms();
		buffers_transfer();
	}

	//destructor
	Scene::~Scene(void)
	{
		delete m_program;
	}

	//draw
	void Scene::draw(void)
	{
		//model
		m_program->use();
		glBindVertexArray(m_vao_id);
		glBindBuffer(GL_ARRAY_BUFFER, m_vbo_id);
		//draw triangles
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_ibo_id);
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr);
	}

	//data
	Program* Scene::program(void) const
	{
		return m_program;
	}

	//setup
	void Scene::setup_gl(void)
	{
		glEnable(GL_BLEND);
		glEnable(GL_DEPTH_TEST);
		glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	}
	void Scene::setup_buffers(void)
	{
		//create
		glGenBuffers(1, &m_vbo_id);
		glGenBuffers(1, &m_ibo_id);
		glGenVertexArrays(1, &m_vao_id);
		//vao setup
		glBindVertexArray(m_vao_id);
		glBindBuffer(GL_ARRAY_BUFFER, m_vbo_id);
		//attributes
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (unsigned*) (0 * sizeof(float)));
	}
	void Scene::setup_shaders(void)
	{
		//shaders
		m_program->vertex_shader()->path("shd/ray-marcher.vert");
		m_program->fragment_shader()->path("shd/ray-marcher.frag");
		//program
		m_program->setup();
	}
	void Scene::setup_uniforms(void)
	{
		//data
		int32_t v[4];
		glGetIntegerv(GL_VIEWPORT, v);
		//uniforms
		glUseProgram(m_program->id());
		glUniform1i(glGetUniformLocation(m_program->id(), "width"), v[2]);
		glUniform1i(glGetUniformLocation(m_program->id(), "height"), v[3]);
		glUniform1f(glGetUniformLocation(m_program->id(), "focal_length"), 1);
		glUniform3f(glGetUniformLocation(m_program->id(), "camera_position"), 0, 0, 0);
		glUniform4f(glGetUniformLocation(m_program->id(), "camera_rotation"), 1, 0, 0, 0);
	}

	//buffers
	void Scene::buffers_transfer(void)
	{
		//data
		const unsigned ibo_data[] = {0, 1, 2, 0, 2, 3};
		const float vbo_data[] = {-1, -1, +1, -1, +1, +1, -1, +1};
		//vbo data
		glBindBuffer(GL_ARRAY_BUFFER, m_vbo_id);
		glBufferData(GL_ARRAY_BUFFER, 8 * sizeof(float), vbo_data, GL_DYNAMIC_DRAW);
		//ibo data
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_ibo_id);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER, 6 * sizeof(unsigned), ibo_data, GL_DYNAMIC_DRAW);
	}
}