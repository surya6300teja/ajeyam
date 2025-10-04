import React, { useState } from 'react';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileLikedBlogs from '../components/profile/ProfileLikedBlogs';
import ProfileSavedBlogs from '../components/profile/ProfileSavedBlogs';
import ProfileFollowingAuthors from '../components/profile/ProfileFollowingAuthors';
import ProfileChangePassword from '../components/profile/ProfileChangePassword';
import { useAuth } from '../context/AuthContext';

const TABS = [
  'Liked Blogs',
  'Saved Blogs',
  'Following Authors',
  'Change Password',
];

const PRIMARY_COLOR = '#992E01';
const BG_COLOR = '#FAF7F3';
const TEXT_COLOR = '#111';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Liked Blogs');
  const { currentUser } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: BG_COLOR }}>
      <div className="max-w-2xl mx-auto py-6 px-2 sm:px-4 md:px-6 lg:px-0">
        {/* Profile Header */}
        <div className="flex flex-col items-center bg-white rounded-3xl shadow-xl p-6 sm:p-8 relative mb-6 sm:mb-8 border border-[#f0e9e0]">
          <div className="relative">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4"
              style={{ borderColor: PRIMARY_COLOR, boxShadow: '0 4px 24px 0 rgba(153,46,1,0.10)' }}
            />
            {/* Floating Edit Button */}
            <button
              className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-[#f5f2ed] transition"
              style={{ color: PRIMARY_COLOR }}
              title="Edit Profile"
              onClick={() => setActiveTab('Overview')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L8.466 18.823a4.2 4.2 0 0 1-1.768 1.06l-3.07.878a.6.6 0 0 1-.74-.74l.878-3.07a4.2 4.2 0 0 1 1.06-1.768L16.862 4.487ZM19.5 6.75l-1.5-1.5" />
              </svg>
            </button>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl sm:text-2xl font-extrabold" style={{ color: PRIMARY_COLOR }}>{currentUser?.name}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 break-all">{currentUser?.email}</div>
            <div className="text-sm sm:text-base mt-2 text-gray-700" style={{ color: TEXT_COLOR }}>
              {currentUser?.bio || <span className="italic text-gray-400">No bio yet.</span>}
            </div>
          </div>
        </div>
        {/* Stats Row */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-[#fff7f2] rounded-xl p-3 sm:p-4 flex flex-col items-center shadow-sm border border-[#f0e9e0]">
            <span className="text-base sm:text-lg font-bold" style={{ color: PRIMARY_COLOR }}>{currentUser?.blogsCount || 0}</span>
            <span className="text-xs text-gray-500 mt-1">Blogs</span>
          </div>
          <div className="bg-[#fff7f2] rounded-xl p-3 sm:p-4 flex flex-col items-center shadow-sm border border-[#f0e9e0]">
            <span className="text-base sm:text-lg font-bold" style={{ color: PRIMARY_COLOR }}>0</span>
            <span className="text-xs text-gray-500 mt-1">Followers</span>
          </div>
          <div className="bg-[#fff7f2] rounded-xl p-3 sm:p-4 flex flex-col items-center shadow-sm border border-[#f0e9e0]">
            <span className="text-base sm:text-lg font-bold" style={{ color: PRIMARY_COLOR }}>{currentUser?.following?.length || 0}</span>
            <span className="text-xs text-gray-500 mt-1">Following</span>
          </div>
          <div className="bg-[#fff7f2] rounded-xl p-3 sm:p-4 flex flex-col items-center shadow-sm border border-[#f0e9e0]">
            <span className="text-base sm:text-lg font-bold" style={{ color: PRIMARY_COLOR }}>{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '--'}</span>
            <span className="text-xs text-gray-500 mt-1">Joined</span>
          </div>
        </div> */}
        {/* Tabs Navigation */}
        <div className="sticky top-0 z-10 bg-transparent mb-4">
          <div className="flex flex-nowrap overflow-x-auto gap-2 sm:gap-4 px-1 hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`px-5 py-2 font-semibold focus:outline-none transition-all duration-200 text-xs sm:text-base border shadow-sm whitespace-nowrap`}
                style={
                  activeTab === tab
                    ? {
                        background: PRIMARY_COLOR,
                        color: '#fff',
                        borderColor: PRIMARY_COLOR,
                        boxShadow: '0 2px 8px 0 rgba(153,46,1,0.10)',
                        borderRadius: 0,
                        transform: 'scale(1.05)',
                      }
                    : {
                        background: '#fff',
                        color: PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR + '22',
                        borderRadius: 0,
                      }
                }
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <div className="mt-4 sm:mt-6">
          <div className="rounded-2xl bg-white shadow-lg border border-[#f0e9e0] p-3 sm:p-8" style={{ color: TEXT_COLOR }}>
            {activeTab === 'Overview' && <ProfileOverview primaryColor={PRIMARY_COLOR} textColor={TEXT_COLOR} />}
            {activeTab === 'Liked Blogs' && <ProfileLikedBlogs primaryColor={PRIMARY_COLOR} textColor={TEXT_COLOR} />}
            {activeTab === 'Saved Blogs' && <ProfileSavedBlogs primaryColor={PRIMARY_COLOR} textColor={TEXT_COLOR} />}
            {activeTab === 'Following Authors' && <ProfileFollowingAuthors primaryColor={PRIMARY_COLOR} textColor={TEXT_COLOR} />}
            {activeTab === 'Change Password' && <ProfileChangePassword primaryColor={PRIMARY_COLOR} textColor={TEXT_COLOR} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 