const { runQuery } = require('./../lib/database');

const formatDate = date => {
    const yr = date.getFullYear();
    const mon = date.getMonth() + 1;
    const dt = date.getDate();
    const hrs = date.getHours();
    const mins = date.getMinutes();
    const secs = date.getSeconds();
    return `${yr}. ${mon}. ${dt} ${hrs}:${mins}:${secs}`;
};

const replaceDate = article => {
    if (article) {
        article.createdAt = formatDate(article.createdAt);
        article.lastUpdated = formatDate(article.lastUpdated);
    }
    return article;
};

const getList = async (start, count) => {
    const line = 'SELECT articles.id, articles.title, articles.created_at AS createdAt, ' +
                    'articles.last_updated AS lastUpdated, users.display_name AS displayName ' +
                'FROM articles INNER JOIN users ON articles.author = users.id ' +
                'WHERE articles.is_active = 1 AND articles.is_deleted = 0 ' +
                'ORDER BY articles.id DESC LIMIT ?, ?';
    const result = await runQuery(line, [start, count]);
    return result.map(replaceDate);
}

const getTotalCount = async () => {
    const line = 'SELECT COUNT(*) AS articleCount FROM articles WHERE is_active = 1 AND is_deleted = 0';
    const result = await runQuery(line);
    return result[0].articleCount;
};

const getById = async (id) => {
    const line = 'SELECT articles.id, articles.title, articles.content, articles.created_at AS createdAt, ' +
                    'articles.last_updated AS lastUpdated, articles.author, users.display_name AS displayName ' +
                'FROM articles INNER JOIN users ON articles.author = users.id ' +
                'WHERE articles.id = ? AND articles.is_active = 1 AND articles.is_deleted = 0';
    const result = await runQuery(line, [id]);
    return replaceDate(result[0]);
};

const getByIdAndAuthor = async (id, author) => {
    const line = 'SELECT title, content, author, created_at AS createdAt, last_updated AS lastUpdated ' +
                'FROM articles ' +
                'WHERE id = ? AND author = ? AND is_active = 1 AND is_deleted = 0';
    const result = await runQuery(line, [id, author.id]);
    return replaceDate(result[0]);
};

const create = async (title, content, author) => {
    const line = 'INSERT INTO articles (title, content, author) VALUES (?, ?, ?)';
    const result = await runQuery(line, [title, content, author.id]);
    return result.insertId; 
};

const update = async (id, title, content) => {
    const line = 'UPDATE articles SET title = ?, content = ? WHERE id = ?';
    await runQuery(line, [title, content, id]);
};

const remove = async (id) => {
    const line = 'UPDATE articles SET is_deleted = 1 WHERE id = ?';
    await runQuery(line, [id]);
};

module.exports = {
    getList,
    getTotalCount, 
    getById,
    getByIdAndAuthor,
    create, 
    update, 
    remove, 
};