// time to build a node js site with no node js experience.
// a lot of this is taken from tutorials and documentation.
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 3000; // heroku likes to be special; i hate this bc i can't actually run it rn, I have to change it to static port and then remember to change it back when I push to heroku grrr.

// idk what this does but it was used in npm documentation
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// cool lil database
const db = new Database(':memory:');
db.exec(`
  CREATE TABLE historical_figures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    era TEXT,
    accomplishments TEXT,
    impact TEXT,
    votes INTEGER
  );
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

db.exec(`ALTER TABLE historical_figures ADD COLUMN stock REAL DEFAULT '100.0'`);

// who needs react when you can use this amazing html template????
const htmlTemplate = (content, leftSidebar, rightSidebar) => `
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
        }
        body {
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 0;
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 0 10px;
            transition: all 0.3s ease;
        }
        .sidebar:hover {
            box-shadow: 0 6px 12px rgba(255,255,255,0.1);
        }
        h1, h2, h3 {
            font-family: 'Montserrat', sans-serif;
            color: var(--text-color);
            text-align: center;
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        h2 {
            font-size: 1.8em;
            color: var(--primary-color);
        }
        .figure-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }
        .historical-figure {
            background-color: var(--card-background);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
            box-shadow: 0 8px 15px rgba(255,255,255,0.1);
        }
        .historical-figure h3 {
            color: var(--primary-color);
            margin-top: 0;
            font-size: 1.5em;
            text-align: left;
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
        .era {
            font-style: italic;
            color: var(--text-secondary);
        }
        button {
            background-color: var(--primary-color);
            color: var(--text-color);
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: auto;
        }
        button:hover {
            background-color: var(--secondary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255,255,255,0.2);
        }
        .nav-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: var(--text-color);
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s ease;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .nav-link:hover {
            background-color: var(--secondary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(255,255,255,0.2);
        }
        .votes {
            font-size: 1.2em;
            font-weight: bold;
            color: var(--accent-color);
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
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: var(--accent-color);
        }
        .quote {
            font-style: italic;
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background-color: rgba(255,255,255,0.05);
            border-radius: 10px;
            border-left: 4px solid var(--accent-color);
        }
        .disclaimer {
            background-color: rgba(255,255,255,0.05);
            color: var(--text-secondary);
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #333;
            border-radius: 5px;
        }
        .stock-value {
            font-size: 1.2em;
            font-weight: bold;
            padding: 5px 10px;
            border-radius: 5px;
            display: inline-block;
            transition: all 0.3s ease;
        }
        .stock-value[data-trend="up"] {
            background-color: #4CAF50;
            color: white;
        }
        .stock-value[data-trend="down"] {
            background-color: #F44336;
            color: white;
        }
        .stock-value[data-trend="neutral"] {
            background-color: #FFC107;
            color: black;
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
    </style>
</head>
<body>
    <div class="container">
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


// home page
app.get('/', (req, res) => {
    // gets two random people
    const figures = db.prepare('SELECT * FROM historical_figures ORDER BY RANDOM() LIMIT 2').all();
    const totalVotes = db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total;
    const totalFigures = db.prepare('SELECT COUNT(*) as count FROM historical_figures').get().count;

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
            </div>
          `).join('')}
        </div>
      <input type="hidden" name="notVotedFor" value="${figures[0].id === parseInt(figures[0].id) ? figures[1].id : figures[0].id}">
    </form>
    <div style="text-align: center; margin-top: 20px;">
      <a href="/rankings" class="nav-link">View Rankings</a>
    </div>
  `;

    // not a sidebar, now a horizontal bar
    const leftSidebar = `
    <h2>Voting Statistics</h2>
    <div class="stat">
      <div class="stat-value">${totalVotes}</div>
      <div>Total Votes Cast</div>
    </div>
    <div class="stat">
      <div class="stat-value">${totalFigures}</div>
      <div>Total People in Database</div>
    </div>
  `;

    // once again i changed this but I'm not gonna refractor it
    const rightSidebar = `
    <h2>Add a Person</h2>
    <p>If you believe that the greatest person is not contained within our database, you are more than welcome to add to it. Please send an email to whoisthegreatestperson@gmail.com and I will review it as soon as I can.</p>
    <h3>Criteria</h3>
    <ul>
      <li>Long-term historical or present impact</li>
      <li>Global influence</li>
      <li>Lasting legacy on society, culture, or science</li>
      <li>Unique contribution to the world</li>
    </ul>
    <div class="quote">
      You should include the person's name, era, accoplishments and impact.
    </div>
  `;

    res.send(htmlTemplate(content, leftSidebar, rightSidebar));
});


// handling votes
app.post('/vote', (req, res) => {
    const figureId = parseInt(req.body.figure);
    const notVotedForId = parseInt(req.body.notVotedFor);

    // Update the voted figure
    db.prepare('UPDATE historical_figures SET votes = votes + 1, stock = stock * 1.01 WHERE id = ?').run(figureId);

    // Update the figure that wasn't voted for
    db.prepare('UPDATE historical_figures SET stock = stock * 0.99 WHERE id = ?').run(notVotedForId);

    res.redirect('/');
});


// rankings page
app.get('/rankings', (req, res) => {
    const figures = db.prepare('SELECT * FROM historical_figures ORDER BY stock DESC').all();
    const totalVotes = db.prepare('SELECT SUM(votes) as total FROM historical_figures').get().total;

    const content = `
    <h1>The Rankings</h1>
    ${figures.map((figure, index) => `
      <div class="historical-figure">
        <h3>#${index + 1} ${figure.name}</h3>
        <p class="era">${figure.era}</p>
        <p><strong>Key Accomplishments:</strong> ${figure.accomplishments}</p>
        <p><strong>Historical Impact:</strong> ${figure.impact}</p>
        <p class="votes">Votes: ${figure.votes} (${((figure.votes / totalVotes) * 100).toFixed(2)}%)</p>
        <p><strong>Stock Value:</strong> <span class="stock-value">${figure.stock.toFixed(2)}</span></p>
      </div>
    `).join('')}
    <div style="text-align: center; margin-top: 20px;">
      <a href="/" class="nav-link">Back to voting</a>
    </div>
  `;

    // more sidebar shit that arent sidebars anymore
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
    <p>I am currently a developer and student studying computer science. I enjoy making things in my spare time, and have made other projects like an FPS AI and a Medical Diagostic Application. This website is my first project where I used node.js, so there may be issues and oversights within it. To see my other projects, you can checkout my <a href="https://github.com/Cole-Godfrey/">GitHub</a></p>
  `;

    res.send(htmlTemplate(content, leftSidebar, rightSidebar));
});

// Puts server online
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
