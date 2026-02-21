import { UIRenderer } from './ui-renderer.js';

export class ImportExportManager {
  constructor(favorManager, toastContainer) {
    this.favorManager = favorManager;
    this.toastContainer = toastContainer;
  }

  exportCSV() {
    const favors = this.favorManager.getFavors();
    const headers = ['Title', 'Person', 'Description', 'Direction', 'Value', 'Due Date', 'Status', 'Tags', 'Rating', 'Date'];
    const rows = favors.map(f => [
      f.title,
      f.person,
      f.description || '',
      f.direction,
      f.value || '',
      f.dueDate || '',
      f.status,
      (f.tags || []).join('; '),
      f.rating || 0,
      f.date
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favor-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    UIRenderer.showToast('CSV exported', 'success', this.toastContainer);
  }

  importCSV(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or has no data rows');
        }
        
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
        
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            
            if (!values || values.length < 6) {
              console.warn(`Skipping invalid row ${i + 1}`);
              continue;
            }
            
            const cleanValues = values.map(v => 
              v.replace(/^"|"$/g, '').replace(/""/g, '"')
            );
            
            const favorData = {
              title: cleanValues[0],
              person: cleanValues[1],
              description: cleanValues[2],
              direction: cleanValues[3],
              value: cleanValues[4] ? parseInt(cleanValues[4]) : null,
              dueDate: cleanValues[5] || null,
              status: cleanValues[6] || 'pending',
              tags: cleanValues[7] ? cleanValues[7].split('; ').filter(t => t) : [],
              rating: cleanValues[8] ? parseInt(cleanValues[8]) : 0,
              date: cleanValues[9] || new Date().toISOString(),
              comments: []
            };
            this.favorManager.addFavor(favorData);
            imported.push(favorData);
          } catch (rowError) {
            console.error(`Error parsing row ${i + 1}:`, rowError);
          }
        }

        if (imported.length === 0) {
          throw new Error('No valid data found in CSV file');
        }

        UIRenderer.showToast(`Imported ${imported.length} favors`, 'success', this.toastContainer);
      } catch (error) {
        const { ErrorLogger } = window;
        if (ErrorLogger) {
          ErrorLogger.log(error, 'Import CSV');
        }
        UIRenderer.showToast(`Import error: ${error.message}`, 'info', this.toastContainer);
      }
    };
    
    reader.onerror = () => {
      const { ErrorLogger } = window;
      if (ErrorLogger) {
        ErrorLogger.log(new Error('File read error'), 'Import CSV - File Reader');
      }
      UIRenderer.showToast('Error reading file', 'info', this.toastContainer);
    };
    
    reader.readAsText(file);
  }
}