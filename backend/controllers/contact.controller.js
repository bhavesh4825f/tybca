const Contact = require('../models/Contact.model');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      message
    });

    await contact.save();
    res.status(201).json({ 
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ message: 'Failed to submit contact form', error: error.message });
  }
};

// Get all contact queries (Admin only)
exports.getContactQueries = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contact queries', error: error.message });
  }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact query not found' });
    }

    res.json({ message: 'Status updated successfully', contact });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// Delete contact query (Admin only)
exports.deleteContactQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact query not found' });
    }

    res.json({ message: 'Contact query deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Failed to delete contact query', error: error.message });
  }
};
