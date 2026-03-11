export const SignupForm: React.FC = () => {
  return (
    <div className="signup-container">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form className="signup-form">
        <input
          type="text"
          placeholder="Username"
          className="mb-2 p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          className="mb-2 p-2 border border-gray-300 rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-4 p-2 border border-gray-300 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};
