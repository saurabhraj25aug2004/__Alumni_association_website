import React, { useEffect, useState } from "react";
import { announcementAPI } from "../../utils/api";

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // ✅ Fetch only published announcements (same as alumni)
      const res = await announcementAPI.getPublishedAnnouncements();
      
      // Handle both array and object response formats
      const announcementsData = Array.isArray(res.data) 
        ? res.data 
        : (res.data.announcements || []);
      
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching student announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((a) => {
    const matchSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.content?.toLowerCase().includes(search.toLowerCase());
    
    const matchPriority =
      priority === "All" || 
      a.priority?.toLowerCase() === priority.toLowerCase() ||
      (priority === "Normal" && (a.priority === "medium" || a.priority === "Medium"));

    return matchSearch && matchPriority;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Announcements</h1>
          <p className="text-gray-600">
            Stay updated with the latest news and updates from the alumni association
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md p-2 flex-1 min-w-[250px] focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Normal</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={fetchAnnouncements}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <p>Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-600 mt-10 bg-white rounded-lg shadow p-12">
            <span className="text-6xl mb-4">📢</span>
            <p className="text-lg font-semibold mb-2">
              {search || priority !== "All" ? "No announcements match your filters" : "No announcements found"}
            </p>
            {search || priority !== "All" ? (
              <p className="text-sm mb-4">Try adjusting your search or filters</p>
            ) : (
              <p className="text-sm mb-4">Check back later for new announcements</p>
            )}
            <button
              onClick={fetchAnnouncements}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAnnouncements.map((a) => (
              <div
                key={a._id}
                className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  {a.isPinned && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      📌 Pinned
                    </span>
                  )}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    a.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    a.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    a.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {a.priority?.toUpperCase() || 'MEDIUM'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{a.title}</h3>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{a.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {a.author?.profileImage?.url ? (
                      <img
                        className="h-5 w-5 rounded-full object-cover"
                        src={a.author.profileImage.url}
                        alt={a.author.name || 'Author'}
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
                        {a.author?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <span>Priority: {a.priority || 'medium'}</span>
                  </div>
                  <span>{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;
