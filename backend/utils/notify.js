import Notification from "../models/Notification.js";

// Creates a notification, skipping the case where someone triggers an action on their own content.
export const notify = async ({ recipient, actor, type, post = null }) => {
  if (recipient.toString() === actor.toString()) return;
  try {
    await Notification.create({ recipient, actor, type, post });
  } catch (err) {
    console.error("Could not create notification:", err.message);
  }
};
