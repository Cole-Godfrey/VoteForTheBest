const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

const app = express();
const port = process.env.PORT || 3000;

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Initialize flash middleware
app.use(flash());

// Middleware to make flash messages available in all templates
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    next();
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialize file-based SQLite database
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Function to check if a table is empty
const isTableEmpty = (tableName) => {
    const row = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    return row.count === 0;
};

//create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS historical_figures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    era TEXT,
    accomplishments TEXT,
    impact TEXT,
    votes INTEGER DEFAULT 0,
    stock REAL DEFAULT 100.0
  );

  CREATE TABLE IF NOT EXISTS user_credits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    credits INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS user_stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    figure_id INTEGER,
    shares INTEGER DEFAULT 0,
    UNIQUE(user_id, figure_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (figure_id) REFERENCES historical_figures(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    figure_id INTEGER,
    reporter_id INTEGER,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (figure_id) REFERENCES historical_figures(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id)
  );
`);

// Insert initial historical figures if the table is empty
if (isTableEmpty('historical_figures')) {
    db.exec(`
  INSERT INTO historical_figures (name, era, accomplishments, impact, votes) VALUES 
    ('Mahatma Gandhi', '1869-1948', 'Led India to independence through non-violent civil disobedience', 'Inspired civil rights movements worldwide', 0),
    ('Albert Einstein', '1879-1955', 'Developed the theory of relativity', 'Revolutionized our understanding of space, time, and the universe', 0),
    ('Marie Curie', '1867-1934', 'Discovered polonium and radium, pioneered radioactivity research', 'Advanced medical treatments and scientific understanding', 0),
    ('Nelson Mandela', '1918-2013', 'Fought against apartheid, became South Africa''s first black president', 'Promoted reconciliation and social justice', 0),
    ('William Shakespeare', '1564-1616', 'Wrote numerous influential plays and sonnets', 'Shaped English literature and language', 0),
    ('Leonardo da Vinci', '1452-1519', 'Created masterpieces in art, made discoveries in science and engineering', 'Epitomized the Renaissance ideal', 0),
    ('Martin Luther King Jr.', '1929-1968', 'Led the American civil rights movement', 'Advanced civil rights through non-violent resistance', 0),
    ('Ada Lovelace', '1815-1852', 'Wrote the first computer algorithm', 'Pioneered computer programming', 0),
    ('Cleopatra', '69 BC-30 BC', 'Last active ruler of the Ptolemaic Kingdom of Egypt', 'Influenced Roman politics and shaped the ancient world', 0),
    ('Isaac Newton', '1643-1727', 'Developed laws of motion and universal gravitation', 'Laid the foundations for classical mechanics', 0),
    ('Florence Nightingale', '1820-1910', 'Founder of modern nursing', 'Revolutionized healthcare and hospital sanitation', 0),
    ('Aristotle', '384 BC-322 BC', 'Contributed to various fields including physics, metaphysics, poetry, theater, music, logic, rhetoric, linguistics, politics, government, ethics, biology, and zoology', 'Shaped Western philosophy and scientific thought', 0),
    ('Charles Darwin', '1809-1882', 'Developed the theory of evolution by natural selection', 'Revolutionized our understanding of life sciences and human origins', 0),
    ('Rosa Parks', '1913-2005', 'Refused to give up her bus seat to a white passenger', 'Catalyzed the Montgomery Bus Boycott and advanced civil rights', 0),
    ('Galileo Galilei', '1564-1642', 'Improved the telescope and made significant astronomical observations', 'Advanced the scientific revolution and our understanding of the solar system', 0),
    ('Mother Teresa', '1910-1997', 'Founded the Missionaries of Charity, devoted her life to serving the poor', 'Inspired global humanitarian efforts', 0),
    ('Confucius', '551 BC-479 BC', 'Developed a system of social and ethical philosophy', 'Profoundly influenced East Asian thought and values', 0),
    ('Abraham Lincoln', '1809-1865', 'Led the United States through the Civil War, abolished slavery', 'Preserved the Union and modernized the U.S. economy', 0),
    ('Marie Antoinette', '1755-1793', 'Queen of France during the French Revolution', 'Symbolized the excesses of the monarchy and influenced the course of the French Revolution', 0),
    ('Nikola Tesla', '1856-1943', 'Invented the AC electrical system and numerous other technologies', 'Pioneered modern electrical engineering', 0),
    ('Adolf Hitler', '1889-1945', 'Led Nazi Germany', 'Responsible for World War II in Europe and the Holocaust', 0),
    ('Joseph Stalin', '1878-1953', 'Led the Soviet Union', 'Oversaw rapid industrialization and the defeat of Nazi Germany, but also caused millions of deaths through purges and policies', 0),
    ('Mao Zedong', '1893-1976', 'Founded the People''s Republic of China', 'Transformed China into a major power but caused widespread famine and social upheaval', 0),
    ('Genghis Khan', '1162-1227', 'Founded the Mongol Empire', 'Created the largest contiguous land empire in history, causing significant loss of life but also facilitating trade and cultural exchange', 0),
    ('Nero', '37-68', 'Roman Emperor', 'Known for tyrannical rule and the Great Fire of Rome, but also for public works and cultural development', 0),
    ('Pol Pot', '1925-1998', 'Led the Khmer Rouge regime in Cambodia', 'Responsible for the Cambodian genocide and extreme social engineering policies', 0),
    ('Vlad the Impaler', '1428-1477', 'Ruled Wallachia (part of modern Romania)', 'Known for extreme cruelty, but also for defending his land against Ottoman invasion', 0),
    ('Caligula', '12-41', 'Roman Emperor', 'Infamous for his cruelty, extravagance, and perverse behavior, but his rule marked a turning point in Roman history', 0),
    ('Attila the Hun', '406-453', 'Ruler of the Hunnic Empire', 'Led invasions of the Roman Empire, contributing to its eventual fall', 0),
    ('Idi Amin', '1925-2003', 'President of Uganda', 'Known for human rights abuses and expulsion of Asians from Uganda, severely damaging the country''s economy', 0),
    ('Cole Godfrey', '2006-Present', 'Made this website', 'Has not really had a massive impact on the world, but did make some pretty cool coding projects - you should check them out!', 0),
    ('Jesus Christ', '5 BC - 33', 'A central figure in Christianity', 'Revered for his teachings on love, compassion, and salvation, profoundly shaping Western religious and ethical thought.', 0),
    ('Donald Trump', '1946-Present', '45th President of the United States', 'Influenced national and global politics with his controversial policies and distinctive communication style.', 0),
    ('NBA Youngboy', '1999-Present', 'A prominent rapper known for his prolific output and influence in the hip-hop scene', 'Gained significant attention and a dedicated fanbase despite legal and personal challenges.', 0),
    ('Patrick Mahomes', '1995-Present', 'NFL Quarterback for the Kansas City Chiefs', 'Revolutionized the position with his exceptional playmaking skills, winning multiple MVP awards and a Super Bowl.', 0),
    ('Kamala Harris', '1964-Present', 'Vice President of the United States', 'Made history as the first female, first Black, and first South Asian Vice President, focusing on issues like criminal justice reform and international relations.', 0),
    ('Malala Yousafzai', '1997-Present', 'Advocated for female education in Pakistan', 'Became the youngest Nobel Prize laureate and inspired global support for girls'' education', 0),
    ('Steve Jobs', '1955-2011', 'Co-founded Apple Inc., revolutionized personal computing and mobile technology', 'Transformed multiple industries including computing, music, and mobile communications', 0),
    ('Frida Kahlo', '1907-1954', 'Created vibrant self-portraits and works inspired by nature and Mexican culture', 'Became an icon in art, feminism, and LGBTQ+ movements', 0),
    ('Alan Turing', '1912-1954', 'Pioneered computer science and artificial intelligence', 'Helped break the Enigma code during World War II and laid foundations for modern computing', 0),
    ('Helen Keller', '1880-1968', 'First deafblind person to earn a Bachelor of Arts degree', 'Advocated for people with disabilities and inspired millions worldwide', 0),
    ('Harriet Tubman', '1822-1913', 'Escaped slavery and led many others to freedom via the Underground Railroad', 'Became an icon of courage and freedom in American history', 0),
    ('Stephen Hawking', '1942-2018', 'Theoretical physicist who made groundbreaking contributions to cosmology', 'Advanced our understanding of black holes and popularized complex scientific ideas', 0),
    ('Catherine the Great', '1729-1796', 'Empress of Russia who led the country into the Golden Age', 'Expanded Russian borders, modernized administration, and patronized the arts', 0),
    ('Elon Musk', '1971-Present', 'Co-founded PayPal, Tesla, SpaceX, and Neuralink', 'Revolutionized electric vehicles, private space travel, and online payments', 0),
    ('Michelle Obama', '1964-Present', 'Former First Lady of the United States, lawyer, and author', 'Advocated for poverty awareness, education, nutrition, physical activity, and healthy eating', 0),
    ('Jeff Bezos', '1964-Present', 'Founded Amazon and Blue Origin', 'Transformed e-commerce and pursued private space exploration', 0),
    ('Oprah Winfrey', '1954-Present', 'Media executive, actress, talk show host, television producer, and philanthropist', 'Became North America''s first black multi-billionaire and is considered the greatest black philanthropist in American history', 0),
    ('Beyoncé', '1981-Present', 'Singer, songwriter, record producer, dancer, and actress', 'Influenced music industry and popular culture, advocated for social causes', 0),
    ('Malcolm X', '1925-1965', 'Minister and human rights activist', 'Became a prominent figure in the civil rights movement and influenced Black Power movement', 0),
    ('Ruth Bader Ginsburg', '1933-2020', 'Associate Justice of the Supreme Court of the United States', 'Advocated for gender equality and women''s rights', 0),
    ('Tim Berners-Lee', '1955-Present', 'Invented the World Wide Web', 'Revolutionized information sharing and communication globally', 0),
    ('Angela Merkel', '1954-Present', 'Former Chancellor of Germany', 'Led Germany through financial crisis and played a central role in the European Union', 0),
    ('Dalai Lama', '1935-Present', 'Spiritual leader of Tibet', 'Advocated for Tibetan independence and spread Buddhist teachings globally', 0),
    ('Serena Williams', '1981-Present', 'Professional tennis player', 'Dominated women''s tennis and advocated for racial and gender equality in sports', 0),
    ('Mark Zuckerberg', '1984-Present', 'Co-founded Facebook', 'Revolutionized social networking and digital communication', 0),
    ('Aung San Suu Kyi', '1945-Present', 'Politician, diplomat, author', 'Led pro-democracy movement in Myanmar, won Nobel Peace Prize', 0),
    ('Bill Gates', '1955-Present', 'Co-founded Microsoft, philanthropist', 'Revolutionized personal computing and became a leading global philanthropist', 0),
    ('Ursula von der Leyen', '1958-Present', 'President of the European Commission', 'First woman to serve as Germany''s minister of defense, leading figure in European politics', 0),
    ('Shigeru Miyamoto', '1952-Present', 'Japanese video game designer and producer', 'Created some of the most acclaimed and best-selling game franchises of all time', 0),
    ('Volodymyr Zelenskyy', '1978-Present', 'President of Ukraine', 'Led Ukraine''s resistance against Russian invasion, becoming a symbol of national resilience', 0),
    ('Xi Jinping', '1953-Present', 'President of the People''s Republic of China', 'Consolidated power in China and expanded its global influence', 0),
    ('Narendra Modi', '1950-Present', 'Prime Minister of India', 'Implemented major economic and social reforms in India', 0),
    ('Alexei Navalny', '1976-Present', 'Russian opposition leader and anti-corruption activist', 'Challenged Putin''s regime and exposed corruption in Russia', 0),
    ('Jacinda Ardern', '1980-Present', 'Former Prime Minister of New Zealand', 'Led response to Christchurch shootings and COVID-19 pandemic', 0),
    ('Megan Rapinoe', '1985-Present', 'Professional soccer player and activist', 'Advocated for gender equality and LGBTQ+ rights in sports', 0),
    ('Giannis Antetokounmpo', '1994-Present', 'Professional basketball player', 'Inspired with his rags-to-riches story and athletic achievements', 0),
    ('Sebastião Salgado', '1944-Present', 'Photojournalist and environmentalist', 'Documented human condition and nature, raised awareness about environmental issues', 0),
    ('Alexandria Ocasio-Cortez', '1989-Present', 'U.S. Representative', 'Became youngest woman elected to Congress, advocated for progressive policies', 0),
    ('Demis Hassabis', '1976-Present', 'AI researcher and co-founder of DeepMind', 'Pioneered advancements in artificial intelligence', 0),
    ('Ngozi Okonjo-Iweala', '1954-Present', 'Director-General of the World Trade Organization', 'First woman and first African to lead the WTO', 0),
    ('Emmanuelle Charpentier', '1968-Present', 'Microbiologist and biochemist', 'Co-invented CRISPR gene editing technology', 0),
    ('Jennifer Doudna', '1964-Present', 'Biochemist', 'Co-invented CRISPR gene editing technology', 0),
    ('Pep Guardiola', '1971-Present', 'Football manager', 'Revolutionized modern football tactics', 0),
    ('Chimamanda Ngozi Adichie', '1977-Present', 'Author and feminist', 'Contributed to African literature and discourse on feminism', 0),
    ('Mary Barra', '1961-Present', 'CEO of General Motors', 'First female CEO of a major automaker, led GM''s shift to electric vehicles', 0),
    ('Banksy', 'Unknown-Present', 'Anonymous street artist', 'Created provocative public art addressing social and political issues', 0),
    ('Kizzmekia Corbett', '1986-Present', 'Viral immunologist', 'Led development of the Moderna COVID-19 vaccine', 0),
    ('Vitalik Buterin', '1994-Present', 'Co-founder of Ethereum', 'Pioneered blockchain technology and cryptocurrency innovations', 0),
    ('Loujain al-Hathloul', '1989-Present', 'Saudi women''s rights activist', 'Advocated for women''s right to drive and ending male guardianship system in Saudi Arabia', 0),
    ('Virgil Abloh', '1980-2021', 'Fashion designer and entrepreneur', 'Pioneered the fusion of streetwear and high fashion', 0),
    ('Billie Eilish', '2001-Present', 'Singer-songwriter', 'Became youngest person to win all four main Grammy categories in one year', 0),
    ('Abiy Ahmed', '1976-Present', 'Prime Minister of Ethiopia', 'Won Nobel Peace Prize for ending 20-year post-war territorial stalemate with Eritrea', 0),
    ('Greta Gerwig', '1983-Present', 'Filmmaker and actress', 'Directed critically acclaimed films and advocated for women in film industry', 0),
    ('Parag Agrawal', '1984-Present', 'Former CEO of Twitter', 'Led Twitter through significant changes and challenges', 0),
    ('Stella McCartney', '1971-Present', 'Fashion designer', 'Pioneered sustainable and ethical fashion practices', 0);
`);
}

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'You must be logged in to view this page.');
    res.redirect('/login');
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        return next();
    }
    req.flash('error', 'You do not have permission to access this page.');
    res.redirect('/');
};

// HTML template function (updated to include report buttons)
const htmlTemplate = (req, content, leftSidebar, rightSidebar) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Greatest People in History</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
    --primary-color: #2196F3;
    --secondary-color: #FF4081;
    --background-color: #121212;
    --card-background: #1E1E1E;
    --text-color: #FFFFFF;
    --text-secondary: #B0BEC5;
    --accent-color: #64FFDA;
    --gradient-start: #3F51B5;
    --gradient-end: #00BCD4;
}
html {
    height: 100%;
    overflow: hidden;
}
body {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1a1a1a, #2c2c2c, #1a1a1a);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}
@keyframes gradientBG {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.container {
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.sidebar-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.main-content {
    flex: 2;
    padding: 0 20px;
}

.sidebar {
    flex: 1;
    padding: 20px;
    background-color: var(--card-background);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    margin: 0 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.sidebar:hover {
    box-shadow: 0 8px 25px rgba(255,255,255,0.1);
    transform: translateY(-5px);
}

h1, h2, h3 {
    font-family: 'Montserrat', sans-serif;
    color: var(--text-color);
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

h2 {
    font-size: 1.8em;
    color: var(--primary-color);
    position: relative;
    padding-bottom: 10px;
}

h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}

.figure-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}

.historical-figure {
    background-color: var(--card-background);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    margin-bottom: 20px;
    padding: 20px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid #333;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.historical-figure:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(255,255,255,0.1);
}

.historical-figure::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
}

.historical-figure h3 {
    color: var(--primary-color);
    margin-top: 0;
    font-size: 1.5em;
    text-align: left;
    position: relative;
    padding-left: 0; /* Remove left padding */
}

.historical-figure h3::before {
    content: none;
    position: absolute;
    left: 0;
    color: var(--accent-color);
}

.era {
    font-style: italic;
    color: var(--text-secondary);
    position: relative;
    padding-left: 0; /* Remove left padding */
}

.era::before {
    content: none;
    position: absolute;
    left: 0;
    color: var(--accent-color);
}

button {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: var(--text-color);
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: auto;
    position: relative;
    overflow: hidden;
}

button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: all 0.5s;
}

button:hover::before {
    left: 100%;
}

button:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(255,255,255,0.2);
}

.nav-link {
    display: inline-block;
    padding: 10px 20px;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: var(--text-color);
    text-decoration: none;
    border-radius: 25px;
    transition: all 0.3s ease;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
    margin: 0 10px;
}

.nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: all 0.5s;
}

.nav-link:hover::before {
    left: 100%;
}

.nav-link:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 5px 15px rgba(255,255,255,0.2);
}

.votes {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--accent-color);
    text-align: center;
    padding: 5px;
    border-radius: 5px;
    background: rgba(255,255,255,0.1);
    margin: 10px 0;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.historical-figure {
    animation: fadeIn 0.5s ease-out;
}

.stat {
    text-align: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    transition: all 0.3s ease;
}

.stat:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(255,255,255,0.1);
}

.stat-value {
    font-size: 2em;
    font-weight: bold;
    color: var(--accent-color);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.quote {
    font-style: italic;
    text-align: center;
    margin: 20px 0;
    padding: 15px;
    background-color: rgba(255,255,255,0.05);
    border-radius: 10px;
    border-left: 4px solid var(--accent-color);
    position: relative;
}

.quote::before, .quote::after {
    content: none;
    font-size: 2em;
    color: var(--accent-color);
    position: absolute;
    opacity: 0.5;
}

.quote::before {
    top: 0;
    left: 10px;
}

.quote::after {
    bottom: -10px;
    right: 10px;
}

.disclaimer {
    background-color: rgba(255,255,255,0.05);
    color: var(--text-secondary);
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid #333;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
}

.disclaimer::before {
    content: none;
    font-size: 2em;
    color: var(--secondary-color);
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
}

.stock-value {
    font-size: 1.2em;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 5px;
    display: inline-block;
    transition: all 0.3s ease;
    vertical-align: middle;
}

.stock-value[data-trend="up"] {
    background-color: #4CAF50;
    color: white;
    box-shadow: 0 2px 5px rgba(76, 175, 80, 0.3);
}

.stock-value[data-trend="down"] {
    background-color: #F44336;
    color: white;
    box-shadow: 0 2px 5px rgba(244, 67, 54, 0.3);
}

.stock-value[data-trend="neutral"] {
    background-color: #FFC107;
    color: black;
    box-shadow: 0 2px 5px rgba(255, 193, 7, 0.3);
}

@media (max-width: 1024px) {
    .container {
        flex-direction: column;
    }
    .sidebar {
        margin-bottom: 20px;
    }
    .figure-container {
        flex-direction: column;
    }
}

.add-person-form {
    background-color: var(--card-background);
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.add-person-form input[type="text"],
.add-person-form textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    background-color: var(--background-color);
    border: 1px solid var(--text-secondary);
    color: var(--text-color);
    border-radius: 5px;
    transition: all 0.3s ease;
}

.add-person-form input[type="text"]:focus,
.add-person-form textarea:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.5);
}

.add-person-form button {
    width: 100%;
}

.user-info {
    background-color: var(--card-background);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    margin-top: 40px;
    clear: both;
}

.user-info h2 {
    color: var(--primary-color);
    margin-top: 0;
}

.credit-display {
    font-size: 1.5em;
    color: var(--accent-color);
    margin-bottom: 10px;
    text-align: center;
    padding: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 5px;
}

.stock-list {
    list-style-type: none;
    padding: 0;
}

.stock-item {
    background-color: rgba(255,255,255,0.05);
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
}

.stock-item:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 10px rgba(255,255,255,0.1);
}

.stock-name {
    font-weight: bold;
    color: var(--primary-color);
}

.stock-details {
    text-align: right;
}

.stock-shares {
    color: var(--text-secondary);
    font-style: italic;
}

.stock-value {
    color: var(--accent-color);
    font-weight: bold;
}

.info-text {
    background-color: rgba(255,255,255,0.1);
    border-left: 4px solid var(--accent-color);
    padding: 15px;
    margin: 15px 0;
    font-style: italic;
    position: relative;
    overflow: hidden;
}

.info-text::before {
    content: 'i';
    font-style: normal;
    font-weight: bold;
    color: var(--accent-color);
    position: absolute;
    top: 5px;
    left: 5px;
    font-size: 0.8em;
    background: rgba(255,255,255,0.1);
 width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* New styles for enhanced visual appeal */

.historical-figure {
    backdrop-filter: blur(5px);
    background-color: rgba(30, 30, 30, 0.7);
}

.historical-figure::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    pointer-events: none;
}

.votes::before {
    content: none;
    color: var(--accent-color);
    margin-right: 5px;
}

.era::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--text-secondary), transparent);
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.stat:hover .stat-value {
    animation: pulse 1s infinite;
}

.nav-link {
    border: 2px solid transparent;
    background-size: 200% 100%;
    background-position: 100% 0;
    transition: all 0.3s ease, background-position 0.5s ease-out;
}

.nav-link:hover {
    background-position: 0 0;
    border-color: var(--accent-color);
}

.stock-value {
    position: relative;
    overflow: hidden;
}

.stock-value::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stock-value:hover::before {
    opacity: 1;
}

@keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.disclaimer {
    animation: slideIn 0.5s ease-out;
}

.add-person-form {
    position: relative;
    overflow: hidden;
}

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
}

.user-info {
    animation: float 5s ease-in-out infinite;
}

.credit-display {
    position: relative;
    overflow: hidden;
}

@keyframes shine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}

h1 {
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--primary-color));
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shine 3s linear infinite;
}

.stock-item {
    position: relative;
    overflow: hidden;
}

.stock-item::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.stock-item:hover::after {
    opacity: 1;
}

@media (max-width: 768px) {
    .figure-container {
        flex-direction: column;
    }

    .historical-figure {
        margin-bottom: 30px;
    }

    .sidebar {
        margin-bottom: 30px;
    }

    h1 {
        font-size: 2em;
    }

    .stat-value {
        font-size: 1.5em;
    }
}

@media (max-width: 480px) {
    .container {
        padding: 10px;
    }

    h1 {
        font-size: 1.8em;
    }

    .historical-figure {
        padding: 15px;
    }

    .nav-link {
        display: block;
        margin-bottom: 10px;
    }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

.screen-reader-text {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    word-wrap: normal !important;
}

:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
}
        .report-button {
            background-color: #ff4d4d;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.8em;
            margin-top: 10px;
        }
        .report-button:hover {
            background-color: #ff3333;
        }
    </style>
</head>
<body>
    <div class="container">
        <nav style="text-align: center; margin-bottom: 20px;">
            ${req.session && req.session.userId ? `
                <a href="/logout" class="nav-link">Log Out</a>
                ${req.session.isAdmin ? `<a href="/admin/reports" class="nav-link">Manage Reports</a>` : ''}
            ` : `
                <a href="/login" class="nav-link">Log In</a>
                <a href="/signup" class="nav-link">Sign Up</a>
            `}
        </nav>
        <div class="sidebar">
            ${content}
        </div>
        <div class="main-content">
            <div class="disclaimer">
                <strong>Disclaimer:</strong> This list includes figures who have had both positive and negative impacts on history. 
                The inclusion of any individual does not imply endorsement of their actions. 
                This voting exercise is intended to promote discussion about historical influence and its complexities.
            </div>
            ${leftSidebar}
        </div>
        <div class="sidebar">
            ${rightSidebar}
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const stockValues = document.querySelectorAll('.stock-value');
            stockValues.forEach(stockValue => {
                const value = parseFloat(stockValue.textContent);
                if (value > 100) {
                    stockValue.setAttribute('data-trend', 'up');
                } else if (value < 100) {
                    stockValue.setAttribute('data-trend', 'down');
                } else {
                    stockValue.setAttribute('data-trend', 'neutral');
                }
            });
        });
    </script>
</body>
</html>
`;

// Home page (updated to include report buttons)
app.get('/', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    // Gets two random people
    const figures = db.prepare('SELECT * FROM historical_figures ORDER BY RANDOM() LIMIT 2').all();
    const totalVotes = db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total || 0;
    const totalFigures = db.prepare('SELECT COUNT(*) as count FROM historical_figures').get().count || 0;

    // Get or create user credits
    let userCredits = db.prepare('SELECT credits FROM user_credits WHERE user_id = ?').get(userId);
    if (!userCredits) {
        db.prepare('INSERT INTO user_credits (user_id, credits) VALUES (?, 0)').run(userId);
        userCredits = { credits: 0 };
    }

    // Get user stocks
    const userStocks = db.prepare(`
        SELECT hf.name, us.shares, hf.stock
        FROM user_stocks us
        JOIN historical_figures hf ON us.figure_id = hf.id
        WHERE us.user_id = ?
    `).all(userId);

    const content = `
    <h1>Vote for the Greatest Person in History</h1>

    <form action="/vote" method="post">
        <div class="figure-container">
          ${figures.map(figure => `
            <div class="historical-figure">
              <h3>${figure.name}</h3>
              <p class="era">${figure.era}</p>
              <p><strong>Key Accomplishments:</strong> ${figure.accomplishments}</p>
              <p><strong>Historical Impact:</strong> ${figure.impact}</p>
              <p><strong>Stock Value:</strong> <span class="stock-value">${figure.stock.toFixed(2)}</span></p>
              <button name="figure" value="${figure.id}">Vote for ${figure.name}</button>
              <button class="report-button" onclick="reportFigure(${figure.id}, '${figure.name}'); return false;">Report</button>
            </div>
          `).join('')}
        </div>
      <input type="hidden" name="notVotedFor" value="${figures[0].id === parseInt(figures[0].id) ? figures[1].id : figures[0].id}">
    </form>
    <div style="text-align: center; margin-top: 20px;">
      <a href="/rankings" class="nav-link">View Rankings</a>
      <a href="/user-stocks" class="nav-link">View Other Users' Stocks</a>
    </div>
    <div class="user-info">
        <h2>Your Account</h2>
        <div class="credit-display">Credits: ${userCredits.credits}</div>
        <p class="info-text">At 50 Credits, you can buy a random person's stock!</p>
        ${userCredits.credits >= 50 ? `
            <form action="/buy-stock" method="post">
                <button type="submit">Buy Random Stock (50 credits)</button>
            </form>
        ` : ''}
        ${userStocks.length > 0 ? `
            <h3>Your Stocks</h3>
            <ul class="stock-list">
                ${userStocks.map(stock => `
                    <li class="stock-item">
                        <span class="stock-name">${stock.name}</span>
                        <div class="stock-details">
                            <span class="stock-shares">${stock.shares} shares</span>
                            <br>
                            <span class="stock-value">Value: ${(stock.shares * stock.stock).toFixed(2)}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        ` : ''}
    </div>
<script>
function reportFigure(figureId, figureName) {
    const reason = prompt(\`Why are you reporting \${figureName}?\`);
    if (reason) {
        fetch('/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ figureId, reason }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report submitted successfully.');
            } else {
                alert('Failed to submit report. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while submitting the report.');
        });
    }
}
</script>
  `;

    // Sidebar content
    const leftSidebar = `
    <h2>Voting Statistics</h2>
    <div class="stat">
      <div class="stat-value">${totalVotes}</div>
      <div>Total Votes Cast</div>
    </div>
    <div class="stat">
      <div class="stat-value">${totalFigures}</div>
      <div>Total Figures in Database</div>
    </div>
  `;

    // Right sidebar content
    const rightSidebar = `
    <h2>Add a Person</h2>
    <form class="add-person-form" action="/add-person" method="post">
        <input type="text" name="name" placeholder="Name" required>
        <input type="text" name="era" placeholder="Era" required>
        <textarea name="accomplishments" placeholder="Key Accomplishments" required></textarea>
        <textarea name="impact" placeholder="Historical Impact" required></textarea>
        <button type="submit">Add Person</button>
    </form>
    <div class="quote">
      Please ensure the information is accurate and the person meets the criteria for historical significance.
    </div>
  `;

    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

// Route to display the sign-up form
app.get('/signup', (req, res) => {
    const content = `
    <h1>Sign Up</h1>
    ${res.locals.error_messages.map(msg => `<p style="color: red;">${msg}</p>`).join('')}
    ${res.locals.success_messages.map(msg => `<p style="color: green;">${msg}</p>`).join('')}
    <form action="/signup" method="post">
        <input type="text" name="username" placeholder="Username" required>
        <br><br>
        <input type="password" name="password" placeholder="Password" required>
        <br><br>
        <button type="submit">Sign Up</button>
    </form>
    <p>Already have an account? <a href="/login">Log In</a></p>
    `;

    const leftSidebar = `
        <h2>Voting Statistics</h2>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total || 0}</div>
          <div>Total Votes Cast</div>
        </div>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT COUNT(*) as count FROM historical_figures').get().count || 0}</div>
          <div>Total Figures in Database</div>
        </div>
    `;

    const rightSidebar = `
        <h2>About the Developer</h2>
        <p>I am currently a developer and student studying computer science. I enjoy making things in my spare time, and have made other projects like an FPS AI and a Medical Diagnostic Application. This website is my first project where I used node.js, so there may be issues and oversights within it. To see my other projects, you can check out my <a href="https://github.com/Cole-Godfrey/">GitHub</a>.</p>
    `;

    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

// Route to handle user sign-up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        req.flash('error', 'Please provide both username and password.');
        return res.redirect('/signup');
    }

    try {
        // Check if username already exists
        const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (existingUser) {
            req.flash('error', 'Username already taken.');
            return res.redirect('/signup');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
        const userId = result.lastInsertRowid;

        // Initialize user credits
        db.prepare('INSERT INTO user_credits (user_id, credits) VALUES (?, 0)').run(userId);

        req.flash('success', 'Registration successful. You can now log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error during sign-up:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/signup');
    }
});

// Route to display the login form
app.get('/login', (req, res) => {
    const content = `
    <h1>Log In</h1>
    ${res.locals.error_messages.map(msg => `<p style="color: red;">${msg}</p>`).join('')}
    ${res.locals.success_messages.map(msg => `<p style="color: green;">${msg}</p>`).join('')}
    <form action="/login" method="post">
        <input type="text" name="username" placeholder="Username" required>
        <br><br>
        <input type="password" name="password" placeholder="Password" required>
        <br><br>
        <button type="submit">Log In</button>
    </form>
    <p>Don't have an account? <a href="/signup">Sign Up</a></p>
    `;

    const leftSidebar = `
        <h2>Voting Statistics</h2>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total || 0}</div>
          <div>Total Votes Cast</div>
        </div>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT COUNT(*) as count FROM historical_figures').get().count || 0}</div>
          <div>Total Figures in Database</div>
        </div>
    `;

    const rightSidebar = `
        <h2>About the Developer</h2>
        <p>I am currently a developer and student studying computer science. I enjoy making things in my spare time, and have made other projects like an FPS AI and a Medical Diagnostic Application. This website is my first project where I used node.js, so there may be issues and oversights within it. To see my other projects, you can check out my <a href="https://github.com/Cole-Godfrey/">GitHub</a>.</p>
    `;

    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

// Route to handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Fetch the user from the database
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        // Store the user ID and admin status in the session
        req.session.userId = user.id;
        req.session.isAdmin = user.is_admin === 1;
        res.redirect('/');
    } else {
        req.flash('error', 'Invalid username or password.');
        res.redirect('/login');
    }
});

// Route to handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        res.redirect('/login');
    });
});

// Handling votes (protected)
app.post('/vote', isAuthenticated, (req, res) => {
    const figureId = parseInt(req.body.figure);
    const notVotedForId = parseInt(req.body.notVotedFor);
    const userId = req.session.userId;

    // Ensure user ID exists
    if (!userId) {
        req.flash('error', 'User not logged in.');
        return res.redirect('/login');
    }

    // Update the voted figure
    db.prepare('UPDATE historical_figures SET votes = votes + 1, stock = stock * 1.01 WHERE id = ?').run(figureId);

    // Update the figure that wasn't voted for
    db.prepare('UPDATE historical_figures SET stock = stock * 0.99 WHERE id = ?').run(notVotedForId);

    // Add 1 credit to the user
    try {
        db.prepare('INSERT INTO user_credits (user_id, credits) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET credits = credits + 1')
            .run(userId);
    } catch (error) {
        console.error('Error inserting user credits:', error);
        req.flash('error', 'An error occurred while updating credits.');
        return res.redirect('/');
    }

    res.redirect('/');
});

// Route for buying stocks (protected)
app.post('/buy-stock', isAuthenticated, (req, res) => {
    // Check if user has enough credits
    const userCredits = db.prepare('SELECT credits FROM user_credits WHERE user_id = ?').get(req.session.userId);
    if (!userCredits || userCredits.credits < 50) {
        req.flash('error', 'Not enough credits to buy stock.');
        return res.redirect('/');
    }

    // Select a random figure
    const randomFigure = db.prepare('SELECT id FROM historical_figures ORDER BY RANDOM() LIMIT 1').get();

    // Update user credits
    db.prepare('UPDATE user_credits SET credits = credits - 50 WHERE user_id = ?').run(req.session.userId);

    // Add stock to user_stocks
    db.prepare(`
        INSERT INTO user_stocks (user_id, figure_id, shares)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, figure_id) DO UPDATE SET shares = shares + 1
    `).run(req.session.userId, randomFigure.id);

    res.redirect('/');
});

// Route to add a new person (protected)
app.post('/add-person', isAuthenticated, (req, res) => {
    const { name, era, accomplishments, impact } = req.body;

    // Insert the new person into the database
    try {
        db.prepare('INSERT INTO historical_figures (name, era, accomplishments, impact, votes, stock) VALUES (?, ?, ?, ?, 0, 100.0)')
            .run(name, era, accomplishments, impact);
    } catch (error) {
        console.error('Error adding person:', error);
        // Handle unique constraint violation for name
        req.flash('error', 'A person with this name already exists.');
        return res.redirect('/');
    }

    req.flash('success', 'Person added successfully.');
    res.redirect('/');
});

// New route to handle reports
app.post('/report', isAuthenticated, (req, res) => {
    const { figureId, reason } = req.body;
    const reporterId = req.session.userId;

    try {
        db.prepare('INSERT INTO reports (figure_id, reporter_id, reason) VALUES (?, ?, ?)')
            .run(figureId, reporterId, reason);
        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ success: false, error: 'Failed to submit report' });
    }
});

// New route for admin to view and manage reports
app.get('/admin/reports', isAdmin, (req, res) => {
    const reports = db.prepare(`
        SELECT r.id, r.figure_id, hf.name as figure_name, u.username as reporter, r.reason, r.status, r.created_at
        FROM reports r
        JOIN historical_figures hf ON r.figure_id = hf.id
        JOIN users u ON r.reporter_id = u.id
        ORDER BY r.created_at DESC
    `).all();

    const content = `
        <h1>Manage Reports</h1>
        <table>
            <tr>
                <th>ID</th>
                <th>Figure</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
            </tr>
            ${reports.map(report => `
                <tr>
                    <td>${report.id}</td>
                    <td>${report.figure_name}</td>
                    <td>${report.reporter}</td>
                    <td>${report.reason}</td>
                    <td>${report.status}</td>
                    <td>${report.created_at}</td>
                    <td>
                        ${report.status === 'pending' ? `
                            <button onclick="updateReportStatus(${report.id}, 'resolved', '${report.figure_name}')">Resolve</button>
                            <button onclick="updateReportStatus(${report.id}, 'rejected')">Reject</button>
                        ` : report.status}
                    </td>
                </tr>
            `).join('')}
        </table>
        <script>
        function updateReportStatus(reportId, status, figureName) {
            if (status === 'resolved') {
                if (!confirm('Are you sure you want to resolve this report? This will permanently remove ' + figureName + ' from the database.')) {
                    return;
                }
            }
            fetch('/admin/update-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reportId, status }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload();
                } else {
                    alert('Failed to update report status: ' + data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while updating the report status.');
            });
        }
        </script>
    `;

    const leftSidebar = `
        <h2>Report Statistics</h2>
        <div class="stat">
            <div class="stat-value">${reports.length}</div>
            <div>Total Reports</div>
        </div>
        <div class="stat">
            <div class="stat-value">${reports.filter(r => r.status === 'pending').length}</div>
            <div>Pending Reports</div>
        </div>
    `;

    const rightSidebar = `
        <h2>Actions</h2>
        <a href="/" class="nav-link">Back to Home</a>
    `;

    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

// New route to handle report status updates
app.post('/admin/update-report', isAdmin, (req, res) => {
    const { reportId, status } = req.body;

    db.transaction(() => {
        try {
            if (status === 'resolved') {
                // Fetch the report details
                const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);

                // Delete records in the correct order to satisfy foreign key constraints

                // 1. Delete user stocks related to this figure
                db.prepare('DELETE FROM user_stocks WHERE figure_id = ?').run(report.figure_id);

                // 2. Delete reports related to this figure
                db.prepare('DELETE FROM reports WHERE figure_id = ?').run(report.figure_id);

                // 3. Delete the historical figure
                db.prepare('DELETE FROM historical_figures WHERE id = ?').run(report.figure_id);

                // You might also want to adjust user credits here if necessary

                res.json({ success: true, message: `Report resolved and figure removed from the database.` });
            } else if (status === 'rejected') {
                // Just update the report status
                db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, reportId);
                res.json({ success: true, message: `Report rejected.` });
            } else {
                throw new Error('Invalid status');
            }
        } catch (error) {
            console.error('Error updating report status:', error);
            res.status(500).json({ success: false, error: 'Failed to update report status: ' + error.message });
        }
    })();
});

// Updated Rankings page to include report buttons
app.get('/rankings', isAuthenticated, (req, res) => {
    const figures = db.prepare('SELECT * FROM historical_figures ORDER BY stock DESC').all();
    const totalVotes = db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total || 0;

    // Get user credits
    let userCredits = db.prepare('SELECT credits FROM user_credits WHERE user_id = ?').get(req.session.userId);
    if (!userCredits) {
        userCredits = { credits: 0 };
    }

    // Get user stocks
    const userStocks = db.prepare(`
        SELECT hf.name, us.shares, hf.stock
        FROM user_stocks us
        JOIN historical_figures hf ON us.figure_id = hf.id
        WHERE us.user_id = ?
    `).all(req.session.userId);

    const content = `
    <h1>The Rankings</h1>
    ${userStocks.length > 0 ? `
      <h2>Your Stocks</h2>
      <ul>
        ${userStocks.map(stock => `
          <li>${stock.name}: ${stock.shares} shares (Current value: ${(stock.shares * stock.stock).toFixed(2)})</li>
        `).join('')}
      </ul>
    ` : ''}
    <div style="text-align: center; margin: 20px 0;">
      <a href="/" class="nav-link">Back to Voting</a> |
      <a href="/user-stocks" class="nav-link">View Other Users' Stocks</a>
    </div>
    ${figures.map((figure, index) => `
      <div class="historical-figure">
        <h3>#${index + 1} ${figure.name}</h3>
        <p class="era">${figure.era}</p>
        <p><strong>Key Accomplishments:</strong> ${figure.accomplishments}</p>
        <p><strong>Historical Impact:</strong> ${figure.impact}</p>
        <p class="votes">Votes: ${figure.votes} (${totalVotes > 0 ? ((figure.votes / totalVotes) * 100).toFixed(2) : '0.00'}%)</p>
        <p><strong>Stock Value:</strong> <span class="stock-value">${figure.stock.toFixed(2)}</span></p>
        <button class="report-button" onclick="reportFigure(${figure.id}, '${figure.name}'); return false;">Report</button>
      </div>
    `).join('')}
    <div style="text-align: center; margin-top: 20px;">
      ${userCredits.credits >= 50 ? `
        <form action="/buy-stock" method="post" style="margin-top: 20px;">
          <button type="submit">Buy Random Stock (50 credits)</button>
        </form>
      ` : ''}
    </div>
<script>
function reportFigure(figureId, figureName) {
    const reason = prompt(\`Why are you reporting \${figureName}?\`);
    if (reason) {
        fetch('/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ figureId, reason }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Report submitted successfully.');
            } else {
                alert('Failed to submit report. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while submitting the report.');
        });
    }
}
</script>
    `;

    const leftSidebar = `
    <h2>Voting Statistics</h2>
    <div class="stat">
      <div class="stat-value">${totalVotes}</div>
      <div>Total Votes Cast</div>
    </div>
    <div class="stat">
      <div class="stat-value">${figures.length}</div>
      <div>Ranked Individuals</div>
    </div>
    `;

    const rightSidebar = `
    <h2>About the Developer</h2>
    <p>I am currently a developer and student studying computer science. I enjoy making things in my spare time, and have made other projects like an FPS AI and a Medical Diagnostic Application. This website is my first project where I used node.js, so there may be issues and oversights within it. To see my other projects, you can check out my <a href="https://github.com/Cole-Godfrey/">GitHub</a>.</p>
    `;

    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

// Other User's Stocks Page
app.get('/user-stocks', isAuthenticated, (req, res) => {
    // Fetch all user stocks excluding the current user's stocks
    const userStocks = db.prepare(`
        SELECT us.user_id, u.username, hf.name, us.shares, hf.stock
        FROM user_stocks us
        JOIN historical_figures hf ON us.figure_id = hf.id
        JOIN users u ON us.user_id = u.id
        WHERE us.user_id != ?
    `).all(req.session.userId);

    // Group stocks by user
    const groupedStocks = {};
    userStocks.forEach(stock => {
        if (!groupedStocks[stock.username]) {
            groupedStocks[stock.username] = [];
        }
        groupedStocks[stock.username].push(stock);
    });

    // Generate HTML content
    const content = `
        <h1>Other Users' Stocks</h1>
        <div style="text-align: center; margin-bottom: 20px;">
            <a href="/" class="nav-link">Back to Voting</a>
            <a href="/rankings" class="nav-link">View Rankings</a>
        </div>
        <div class="info-text">
            Note: Your username is visible to other users on this page. This promotes transparency and community interaction.
        </div>
        ${Object.keys(groupedStocks).length === 0 ? `
            <p>No other users have purchased stocks yet.</p>
        ` : `
            ${Object.entries(groupedStocks).map(([username, stocks]) => `
                <div class="user-info">
                    <h2>${username}</h2>
                    <ul class="stock-list">
                        ${stocks.map(stock => `
                            <li class="stock-item">
                                <span class="stock-name">${stock.name}</span>
                                <div class="stock-details">
                                    <span class="stock-shares">${stock.shares} shares</span>
                                    <br>
                                    <span class="stock-value">Value: ${(stock.shares * stock.stock).toFixed(2)}</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('')}
        `}
    `;

    // Sidebar content
    const leftSidebar = `
        <h2>Voting Statistics</h2>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total || 0}</div>
          <div>Total Votes Cast</div>
        </div>
        <div class="stat">
          <div class="stat-value">${db.prepare('SELECT COUNT(*) as count FROM historical_figures').get().count || 0}</div>
          <div>Total Figures in Database</div>
        </div>
    `;

    // Right sidebar content
    const rightSidebar = `
        <h2>About the Developer</h2>
        <p>I am currently a developer and student studying computer science. I enjoy making things in my spare time, and have made other projects like an FPS AI and a Medical Diagnostic Application. This website is my first project where I used node.js, so there may be issues and oversights within it. To see my other projects, you can check out my <a href="https://github.com/Cole-Godfrey/">GitHub</a>.</p>
    `;

    // Send the rendered HTML
    res.send(htmlTemplate(req, content, leftSidebar, rightSidebar));
});

app.post('/create-admin', (req, res) => {
    const { username, password, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Invalid secret key' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        try {
            db.prepare(`
                INSERT INTO users (username, password, is_admin)
                VALUES (?, ?, 1)
                ON CONFLICT(username) DO UPDATE SET
                password = excluded.password, is_admin = 1
            `).run(username, hash);

            res.json({ message: 'Admin user created successfully' });
        } catch (error) {
            console.error('Error creating admin user:', error);
            res.status(500).json({ error: 'Error creating admin user' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
