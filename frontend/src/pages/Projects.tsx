import { useState, useEffect } from 'react';
import { useResource } from '../lib/store';
import { projects } from '../lib/api';
import type { Project } from '../lib/types';
import { ProjectDialog } from '../components/ProjectDialog';

// const statusColors = {
//   planning: 'bg-yellow-100 text-yellow-800',
//   active: 'bg-green-100 text-green-800',
//   completed: 'bg-blue-100 text-blue-800',
// };

// const formatDate = (dateString?: string) => {
//   if (!dateString) return 'N/A';
//   try {
//     return new Date(dateString).toLocaleDateString();
//   } catch (error) {
//     return 'Invalid Date';
//   }
// };

const Projects = () => {
  const { projects: projectsList, setProjects } = useResource();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projects.getAll();
        // Transform the data to match our frontend structure
        const transformedProjects = response.data.map(project => ({
          ...project,
          timeline: {
            startDate: project.startDate,
            endDate: project.endDate
          }
        }));
        setProjects(transformedProjects);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [setProjects]);

  const handleAddProject = async (projectData: Partial<Project>) => {
    try {
      const response = await projects.create({
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        requiredSkills: projectData.requiredSkills,
        teamSize: projectData.teamSize,
        status: projectData.status,
      });
      
      // Transform the response to match our frontend structure
      const newProject = {
        ...response.data,
        timeline: {
          startDate: response.data.startDate,
          endDate: response.data.endDate
        }
      };
      
      setProjects([...projectsList, newProject]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsList.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.requiredSkills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Status: {project.status}</span>
                <span>Timeline: {new Date(project.timeline.startDate).toLocaleDateString()} - {new Date(project.timeline.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddProject}
        project={undefined}
      />
    </div>
  );
};

export default Projects; 