/**
 * User Management API
 * A complete REST API for managing users, posts, and authentication
 */

const users = [];
const posts = [];

/**
 * Get user by ID
 * Retrieves a single user from the database
 * @param {number} userId - The unique user identifier
 * @returns {Object|null} User object containing id, name, email, and createdAt
 */
function getUserById(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
}

/**
 * Create a new user
 * Adds a new user to the system with validation
 * @param {string} name - User's full name (min 2 characters)
 * @param {string} email - User's email address (must be valid format)
 * @param {string} password - User's password (min 8 characters)
 * @returns {Object} Created user object with id and timestamp
 */
function createUser(name, email, password) {
    // Validation
    if (!name || name.length < 2) {
        throw new Error('Name must be at least 2 characters');
    }
    if (!email || !email.includes('@')) {
        throw new Error('Valid email required');
    }
    if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        isActive: true
    };

    users.push(newUser);
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
    };
}

/**
 * Update user information
 * Modifies existing user data with partial updates
 * @param {number} userId - The user ID to update
 * @param {Object} updates - Object containing fields to update (name, email, isActive)
 * @returns {Object|null} Updated user object or null if not found
 */
function updateUser(userId, updates) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        return null;
    }

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (typeof updates.isActive === 'boolean') user.isActive = updates.isActive;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
    };
}

/**
 * Delete user by ID
 * Removes a user and all their associated posts
 * @param {number} userId - The user ID to delete
 * @returns {boolean} True if deleted successfully, false if user not found
 */
function deleteUser(userId) {
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
        return false;
    }

    // Delete user's posts
    const userPosts = posts.filter(p => p.userId === userId);
    userPosts.forEach(post => {
        const postIndex = posts.indexOf(post);
        posts.splice(postIndex, 1);
    });

    // Delete user
    users.splice(index, 1);
    return true;
}

/**
 * Create a post for a user
 * Creates a new blog post associated with a user account
 * @param {number} userId - The ID of the user creating the post
 * @param {string} title - Post title (required, max 200 chars)
 * @param {string} content - Post content (required, max 5000 chars)
 * @param {Array<string>} tags - Optional array of tags
 * @returns {Object} Created post object with id, userId, title, content, tags, and createdAt
 */
function createPost(userId, title, content, tags = []) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (!title || title.length > 200) {
        throw new Error('Title required and must be under 200 characters');
    }

    if (!content || content.length > 5000) {
        throw new Error('Content required and must be under 5000 characters');
    }

    const newPost = {
        id: posts.length + 1,
        userId: userId,
        title: title,
        content: content,
        tags: tags,
        createdAt: new Date().toISOString(),
        likes: 0,
        published: true
    };

    posts.push(newPost);
    return newPost;
}

/**
 * Get all posts by a user
 * Retrieves all posts created by a specific user with optional filtering
 * @param {number} userId - The user ID
 * @param {Object} options - Optional filters: { published: boolean, tag: string, limit: number }
 * @returns {Array<Object>} Array of post objects
 */
function getUserPosts(userId, options = {}) {
    let userPosts = posts.filter(p => p.userId === userId);

    // Apply filters
    if (typeof options.published === 'boolean') {
        userPosts = userPosts.filter(p => p.published === options.published);
    }

    if (options.tag) {
        userPosts = userPosts.filter(p => p.tags.includes(options.tag));
    }

    if (options.limit && options.limit > 0) {
        userPosts = userPosts.slice(0, options.limit);
    }

    return userPosts;
}

/**
 * Search posts by keyword
 * Full-text search across post titles and content
 * @param {string} keyword - Search term (min 3 characters)
 * @param {number} maxResults - Maximum number of results to return (default 10)
 * @returns {Array<Object>} Array of matching posts sorted by relevance
 */
function searchPosts(keyword, maxResults = 10) {
    if (!keyword || keyword.length < 3) {
        throw new Error('Search keyword must be at least 3 characters');
    }

    const lowerKeyword = keyword.toLowerCase();
    const results = posts.filter(p => 
        p.title.toLowerCase().includes(lowerKeyword) ||
        p.content.toLowerCase().includes(lowerKeyword) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );

    return results.slice(0, maxResults);
}

/**
 * Like a post
 * Increments the like counter for a post
 * @param {number} postId - The post ID to like
 * @returns {Object|null} Updated post object with new like count, or null if not found
 */
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return null;
    }

    post.likes += 1;
    return {
        id: post.id,
        title: post.title,
        likes: post.likes
    };
}

/**
 * Get user statistics
 * Returns analytics about a user's activity
 * @param {number} userId - The user ID
 * @returns {Object} Stats object with totalPosts, totalLikes, averageLikesPerPost, and mostPopularPost
 */
function getUserStats(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        throw new Error('User not found');
    }

    const userPosts = posts.filter(p => p.userId === userId);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const mostPopular = userPosts.reduce((max, post) => 
        post.likes > (max?.likes || 0) ? post : max
    , null);

    return {
        userId: userId,
        userName: user.name,
        totalPosts: userPosts.length,
        totalLikes: totalLikes,
        averageLikesPerPost: userPosts.length > 0 ? (totalLikes / userPosts.length).toFixed(2) : 0,
        mostPopularPost: mostPopular ? {
            id: mostPopular.id,
            title: mostPopular.title,
            likes: mostPopular.likes
        } : null
    };
}

// Helper function (internal)
function hashPassword(password) {
    // Simple hash for demo (NOT secure for production!)
    return 'hashed_' + password;
}

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    createPost,
    getUserPosts,
    searchPosts,
    likePost,
    getUserStats
};