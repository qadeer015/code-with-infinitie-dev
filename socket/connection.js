const db = require('../config/db');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const AnnouncementView = require('../models/AnnouncementView');

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("user connected",socket.id);

    socket.on("create announcement", async (data) => {
      const { title, content, user_id } = data;

      try {
        const result = await Announcement.createAnnouncement(title, content, user_id);

        if (result.insertId) {
          // Fetch the newly created announcement
          const [newAnnouncement] = await Announcement.findAnnouncement(result.insertId);

          // Emit the new announcement to all connected clients
          io.emit("new announcement", newAnnouncement);
        }
      } catch (error) {
        console.error("Error creating announcement:", error);
      }
    });

    socket.on("mark viewed", async (data) =>{
      const { user_id, announcement_id } = data;
      try {
        await AnnouncementView.viewedByUser(user_id, announcement_id);
        const unviewed = await AnnouncementView.unViewedCount(user_id);
        socket.emit("update announcement count", { user_id, count: unviewed[0].unviewed_count });
      } catch (error) {
        console.error("Error updating announcementView:", error);
      }
    });

    socket.on("delete announcement", async (data)=>{
      const { announcement_id } = data;
      try {
        console.log("announcement id is : ", announcement_id);
        await Announcement.deleteAnnouncement(announcement_id);
        socket.emit("deleted announcement",{announcement_id : data.announcement_id});
      } catch (error) {
        console.error("Error updating announcementView:", error);
      }
    });

    socket.on("edit announcement", async (data) => {
      const { announcement_id, title, content } = data;
      console.log("Received data for update:", data);
    
      try {
          const updatedAnnouncement = await Announcement.updateAnnouncement(announcement_id, title, content);
          
          if (updatedAnnouncement) {
            console.log("Updated Announcement:", updatedAnnouncement);
            socket.emit("updated announcement", updatedAnnouncement);
        } else {
            console.log("No announcement found with the given ID.");
        }
      } catch (error) {
          console.error("Error updating announcement:", error);
      }
    });
  
  })
}