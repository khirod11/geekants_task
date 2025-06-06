import { useEffect } from 'react';
import { useResource } from '../lib/store';
import { users, projects, assignments } from '../lib/api';

const Dashboard = () => {
  const {
    users: engineers,
    projects: projectsList,
    assignments: assignmentsList,
    setUsers,
    setProjects,
    setAssignments,
  } = useResource();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes, assignmentsRes] = await Promise.all([
          users.getAll(),
          projects.getAll(),
          assignments.getAll(),
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [setUsers, setProjects, setAssignments]);

  const calculateTeamUtilization = () => {
    const totalEngineers = engineers.filter((u) => u.role === 'engineer').length;
    if (totalEngineers === 0) return 0;

    const assignedEngineers = new Set(
      assignmentsList.map((a) => a.engineerId)
    ).size;
    return Math.round((assignedEngineers / totalEngineers) * 100);
  };

  const getProjectStatusCounts = () => {
    return projectsList.reduce(
      (acc, project) => {
        acc[project.status]++;
        return acc;
      },
      { planning: 0, active: 0, completed: 0 }
    );
  };

  const projectStats = getProjectStatusCounts();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Engineers
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {engineers.filter((u) => u.role === 'engineer').length}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Active Projects
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {projectStats.active}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Team Utilization
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {calculateTeamUtilization()}%
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Assignments
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {assignmentsList.length}
          </dd>
        </div>
      </div>

      {/* Project Status */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Project Status Overview
          </h3>
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Planning</p>
              <div className="relative h-2 rounded-full bg-gray-200">
                <div
                  className="absolute h-2 rounded-full bg-yellow-400"
                  style={{
                    width: `${
                      (projectStats.planning / projectsList.length) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {projectStats.planning}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <div className="relative h-2 rounded-full bg-gray-200">
                <div
                  className="absolute h-2 rounded-full bg-green-400"
                  style={{
                    width: `${(projectStats.active / projectsList.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {projectStats.active}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <div className="relative h-2 rounded-full bg-gray-200">
                <div
                  className="absolute h-2 rounded-full bg-blue-400"
                  style={{
                    width: `${
                      (projectStats.completed / projectsList.length) * 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {projectStats.completed}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 