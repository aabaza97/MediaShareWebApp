import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './feature/auth/AuthContext';
import Login from './feature/auth/Login';
import Signup from './feature/auth/Register';
import Home from './feature/home/Home';

// Protected Route Component
const PrivateRoute = ({ children }) => {
	const { user } = useAuth();
	return user ? children : <Navigate to='/login' replace />;
};

const App = () => {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route path='/signup' element={<Signup />} />
					<Route
						path='/home'
						element={
							<PrivateRoute>
								<Home />
							</PrivateRoute>
						}
					/>
					<Route
						path='/'
						element={<Navigate to='/login' replace />}
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
};

export default App;
