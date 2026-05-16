import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  const adminCards = [
    { title: 'Manage Students', link: '/students', icon: '👨‍🎓', description: 'Add, edit, or remove students' },
    { title: 'Manage Teachers', link: '/teachers', icon: '👨‍🏫', description: 'Add, edit, or remove teachers' },
    { title: 'Manage Subjects', link: '/subjects', icon: '📚', description: 'Add, edit, or remove subjects' },
    { title: 'View Reports', link: '/reports', icon: '📊', description: 'View attendance reports and export data' },
  ];

  const teacherCards = [
    { title: 'Mark Attendance', link: '/attendance/mark', icon: '✓', description: 'Mark student attendance' },
    { title: 'View Reports', link: '/reports', icon: '📊', description: 'View attendance reports' },
  ];

  const studentCards = [
    { title: 'My Attendance', link: '/my-attendance', icon: '📅', description: 'View your attendance records' },
  ];

  const cards = user?.role === 'admin' ? adminCards : user?.role === 'teacher' ? teacherCards : studentCards;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, {user?.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {card.title}
              </h2>
              <p className="text-gray-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

// Made with Bob
