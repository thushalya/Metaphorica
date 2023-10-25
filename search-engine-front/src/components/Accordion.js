import React, { useState } from 'react';

const Accordion = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion">
    <button className="accordion-button" onClick={toggleAccordion}>
      {result._source['Line']}
    </button>
    {isOpen && (
      <div className="accordion-content"  style={{ textAlign: 'left' }}>
        <p><strong>Poem Name:</strong> {result._source['Poem name']}</p>
        <p><strong>Poet:</strong> {result._source['Poet']}</p>
        <p><strong>Book:</strong> {result._source.Book}</p>
        <p><strong>Metaphor:</strong> {result._source['Source domain']}</p>
        <p><strong>Target:</strong> {result._source['Target domain']}</p>
        <p><strong>Metaphorical Term:</strong> {result._source['Metaphorical terms']}</p>
        <p><strong>Meaning:</strong> {result._source.Meaning}</p>
      </div>
    )}
  </div>
  
  );
};

export default Accordion;
