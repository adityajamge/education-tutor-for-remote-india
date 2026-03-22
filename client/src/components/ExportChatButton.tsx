import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface ExportChatButtonProps {
  disabled?: boolean;
}

export default function ExportChatButton({ disabled }: ExportChatButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      // Get the chat area element
      const chatArea = document.getElementById('chat-area');
      if (!chatArea) {
        alert('No chat to export!');
        return;
      }

      // Get current theme
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Create a temporary container with exact styling
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.padding = '40px';
      container.style.backgroundColor = isDark ? '#000000' : '#FAFAFA';
      container.style.fontFamily = 'Inter, sans-serif';
      container.style.minHeight = 'auto';
      document.body.appendChild(container);

      // Add header
      const header = document.createElement('div');
      header.style.marginBottom = '30px';
      header.style.borderBottom = isDark ? '2px solid #333' : '2px solid #E5E7EB';
      header.style.paddingBottom = '20px';
      header.innerHTML = `
        <h1 style="color: ${isDark ? '#FFFFFF' : '#111827'}; font-size: 24px; margin: 0 0 8px 0; font-weight: 700;">
          EduTutor Chat Export
        </h1>
        <p style="color: ${isDark ? '#B3B3B3' : '#6B7280'}; font-size: 14px; margin: 0;">
          Exported on ${new Date().toLocaleString()}
        </p>
      `;
      container.appendChild(header);

      // Clone and style messages
      const messages = chatArea.querySelectorAll('.chat-message');
      messages.forEach((msg) => {
        const clone = msg.cloneNode(true) as HTMLElement;
        
        // Apply theme-specific styles
        clone.style.marginBottom = '20px';
        clone.style.padding = '16px 24px';
        clone.style.borderRadius = '8px';
        clone.style.backgroundColor = isDark ? '#181818' : '#FFFFFF';
        clone.style.display = 'flex';
        clone.style.gap = '16px';
        
        // Style avatar
        const avatar = clone.querySelector('.chat-message__avatar') as HTMLElement;
        if (avatar) {
          avatar.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)';
          avatar.style.flexShrink = '0';
        }

        // Style text content
        const textElements = clone.querySelectorAll('*');
        textElements.forEach((el) => {
          const element = el as HTMLElement;
          if (element.classList.contains('chat-message__text')) {
            element.style.color = isDark ? '#FFFFFF' : '#111827';
            element.style.fontSize = '16px';
            element.style.lineHeight = '1.5';
          }
          if (element.classList.contains('chat-message__markdown')) {
            element.style.color = isDark ? '#B3B3B3' : '#4B5563';
            element.style.fontSize = '14px';
            element.style.lineHeight = '1.6';
          }
          // Hide meta info (time, copy button)
          if (element.classList.contains('chat-message__meta')) {
            element.style.display = 'none';
          }
        });

        container.appendChild(clone);
      });

      // Wait for fonts and images to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas with proper height
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: isDark ? '#000000' : '#FAFAFA',
        logging: false,
        windowHeight: container.scrollHeight,
        height: container.scrollHeight,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png');

      // Create PDF with background color
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Background color for PDF
      const bgColor = isDark ? '#000000' : '#FAFAFA';
      
      // Fill first page with background
      pdf.setFillColor(bgColor);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Add pages as needed
      let heightLeft = scaledHeight;
      let position = 0;
      let pageCount = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
      pageCount++;

      while (heightLeft > 0) {
        position = -pdfHeight * pageCount;
        pdf.addPage();
        
        // Fill each new page with background color
        pdf.setFillColor(bgColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
        pageCount++;
      }

      // Save PDF
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`edututor-chat-${timestamp}.pdf`);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chat. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-chat-btn"
      onClick={exportToPDF}
      disabled={disabled || isExporting}
      title="Export chat as PDF"
    >
      {isExporting ? (
        <>
          <div className="export-chat-btn__spinner" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download size={18} />
          <span>Export As PDF</span>
        </>
      )}
    </button>
  );
}
