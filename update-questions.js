// Update questions script
const axios = require('axios');
const fs = require('fs');

async function updateQuestions() {
    try {
        const content = fs.readFileSync('333.txt', 'utf8');
        
        console.log('Sending questions to server for re-parsing...');
        const response = await axios.post('http://localhost:3000/api/upload-questions', {
            content: content
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

updateQuestions();