import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import MediaService from './MediaService';

const initialPosts = [];

const PostCard = ({ post }) => {
	const [likes, setLikes] = useState(post.likes);
	const [liked, setLiked] = useState(false);

	const handleLike = () => {
		if (liked) {
			setLikes(likes - 1);
			setLiked(false);
		} else {
			setLikes(likes + 1);
			setLiked(true);
		}
	};

	const handleShare = (e) => {
		e.preventDefault();
		navigator.clipboard.writeText(post.media);
		alert('Copied link to clipboard!');
	};

	return (
		<div className='bg-white rounded-lg overflow-hidden mb-4'>
			{/* Media Player */}
			{post.type === 'image' ? (
				<img
					src={post.download_url}
					alt='Post media'
					className='w-full h-96 object-contain'
				/>
			) : (
				<video
					src={post.download_url}
					controls
					className='w-full h-96 object-cover'
				/>
			)}

			{/* Post Description */}
			<div className='p-4'>
				<p className='text-gray-800 mb-2'>{post.type}</p>

				{/* Like Button */}
				<div className='flex items-center'>
					<button
						onClick={handleLike}
						className={`flex items-center ${
							liked ? 'text-red-500' : 'text-gray-500'
						}`}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6 mr-2'
							fill={liked ? 'currentColor' : 'none'}
							viewBox='0 0 24 24'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
							/>
						</svg>
						Like
					</button>

					{/* share button */}
					<button
						onClick={handleShare}
						className={`flex items-center ml-4 ${
							liked ? 'text-red-500' : 'text-gray-500'
						}`}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6 mr-2'
							fill={liked ? 'currentColor' : 'none'}
							viewBox='0 0 24 24'
							stroke='currentColor'>
							<path
								d='M20 13V17.5C20 20.5577 16 20.5 12 20.5C8 20.5 4 20.5577 4 17.5V13M12 3L12 15M12 3L16 7M12 3L8 7'
								stroke-width='1.5'
								stroke-linecap='round'
								stroke-linejoin='round'
							/>
						</svg>
						Share
					</button>
				</div>
			</div>
		</div>
	);
};

const Home = () => {
	const { user, logout } = useAuth();
	const [posts, setPosts] = useState(initialPosts);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			console.log('going to login from home');
			navigate('/login');
			return;
		}

		const fetchData = async () => {
			try {
				// Fetch all posts
				const { media } = (await MediaService.fetchAll()).data;
				console.log('Posts:', media);

				setPosts(media);
			} catch (err) {
				// Handle fetch errors
				console.error('Fetch error:', err);
			}
		};

		fetchData();
	}, [user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Logout
			await logout();
			navigate('/login');
		} catch (err) {
			// Handle logout errors
			console.error('Logout error:', err);
		} finally {
			navigate('/login');
		}
	};

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Navbar */}
			<nav className='bg-white '>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						<div className='flex'>
							<div className='flex-shrink-0 flex items-center'>
								<h1 className='text-2xl font-bold text-gray-900'>
									Media Share App
								</h1>
							</div>
						</div>
						<div className='flex items-center'>
							<span className='mr-4 text-gray-700'>
								{user?.email}
							</span>
							<button
								onClick={handleSubmit}
								className='bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4'>
								Upload
							</button>

							<button
								onClick={handleSubmit}
								className='bg-red-400 text-white px-4 py-2 rounded hover:bg-red-600'>
								Logout
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Feed Container */}
			<div className='max-w-2xl mx-auto mt-8'>
				{posts.map((post) => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</div>
	);
};

export default Home;
