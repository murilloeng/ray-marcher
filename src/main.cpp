//std
#include <string>
#include <cstdio>
#include <cstdlib>

//ext
#include "external/cpp/inc/GL/glew.h"
#include "external/cpp/inc/GLFW/glfw3.h"

//ray-marcher
#include "ray-marcher/inc/Scene.hpp"
#include "ray-marcher/inc/Program.hpp"

//data
static GLFWwindow* window;
static ray_marcher::Scene* scene;

//callbacks
static void callback_idle(void)
{
	return;
}
static void callback_display(void)
{
	//clear
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	//draw
	scene->draw();
	//swap
	glfwSwapBuffers(window);
}
static void callback_resize(GLFWwindow* window, int width, int height)
{
	glViewport(0, 0, width, height);
	glUniform1i(glGetUniformLocation(scene->program()->id(), "width"), width);
	glUniform1i(glGetUniformLocation(scene->program()->id(), "height"), height);
}
static void callback_keyboard(GLFWwindow* window, int key, int scancode, int action, int mods)
{
	if(key == GLFW_KEY_ESCAPE)
	{
		glfwSetWindowShouldClose(window, true);
	}
}

int main(int argc, char** argv)
{
	//setup
	if(!glfwInit()) exit(EXIT_FAILURE);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
	window = glfwCreateWindow(700, 700, "Ray Marching", NULL, NULL);
	//glew
	glfwMakeContextCurrent(window);
	if(glewInit() != GLEW_OK) exit(EXIT_FAILURE);
	//callbacks
	glfwSetKeyCallback(window, callback_keyboard);
	glfwSetWindowSizeCallback(window, callback_resize);
	//loop
	scene = new ray_marcher::Scene;
	while(!glfwWindowShouldClose(window))
	{
		callback_idle();
		callback_display();
		glfwPollEvents();
	}
	//delete
	delete scene;
	//destroy window
	glfwDestroyWindow(window);
	//finish glfw
	glfwTerminate();
	//return
	return EXIT_SUCCESS;
}