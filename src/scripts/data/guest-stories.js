const GuestStories = [
  {
    id: "guest-story-1",
    name: "Guest Sample",
    description: "This is a sample story. Login to see real stories from the community!",
    photoUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f5f5dc'/%3E%3Ctext x='250' y='150' font-family='Poppins' font-size='24' text-anchor='middle' alignment-baseline='middle' fill='%238B4513'%3ESample Story%3C/text%3E%3C/svg%3E",
    createdAt: new Date().toISOString(),
  },
  {
    id: "guest-story-2",
    name: "Tikum Team",
    description: "Welcome to Tikum! Create your own story by clicking 'Add New Story' above.",
    photoUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f5f5dc'/%3E%3Ctext x='250' y='150' font-family='Poppins' font-size='24' text-anchor='middle' alignment-baseline='middle' fill='%238B4513'%3ETikum%3C/text%3E%3C/svg%3E",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "guest-story-3",
    name: "Your Story",
    description: "This could be your story! Click 'Add New Story' to get started.",
    photoUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='300' viewBox='0 0 500 300'%3E%3Crect width='500' height='300' fill='%23f5f5dc'/%3E%3Ctext x='250' y='150' font-family='Poppins' font-size='24' text-anchor='middle' alignment-baseline='middle' fill='%23A0522D'%3EYour Story%3C/text%3E%3C/svg%3E",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default GuestStories;
