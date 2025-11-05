import React, { useState } from 'react';

const ContactFormSection = ({ selectedVilla, selectedActivities }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    travelDate: '',
    numberOfPeople: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.travelDate) {
      newErrors.travelDate = 'Travel date is required';
    }
    
    if (!formData.numberOfPeople) {
      newErrors.numberOfPeople = 'Number of people is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Please add a message';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Netlify Forms automatically handles form submission
      // Just submit the form normally, Netlify will intercept it
      const formElement = e.target;
      const formDataToSend = new FormData(formElement);
      
      // Add selected villa and activities to the form data
      if (selectedVilla) {
        formDataToSend.set('villa-selected', selectedVilla.name);
      }
      
      if (selectedActivities.length > 0) {
        const activitiesList = selectedActivities.map(a => `${a.name} (${a.duration})`).join(', ');
        formDataToSend.set('activities-selected', activitiesList);
      }

      // Submit to Netlify
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formDataToSend).toString()
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your inquiry. Please try again or contact us directly at propertieswithmeritt@yahoo.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      travelDate: '',
      numberOfPeople: ''
    });
  };

  return (
    <section id="contact" className="py-20 bg-light">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="heading-2 text-dark mb-4">
            Complete Your Inquiry
          </h2>
          <p className="body-large text-gray max-w-2xl mx-auto">
            Submit your details and our team will contact you to finalize your perfect Costa Rica vacation
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="heading-3 text-dark mb-4">Thank You!</h3>
            <p className="body-regular text-gray mb-6">
              Your inquiry has been received. Our team will contact you within 24 hours to discuss your vacation plans.
            </p>
            <button onClick={resetForm} className="btn btn-primary">
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-lg">
            {/* Selection Summary */}
            {(selectedVilla || selectedActivities.length > 0) && (
              <div className="mb-8 p-6 bg-light rounded-xl">
                <h3 className="heading-4 text-dark mb-4">Your Selection</h3>
                
                {selectedVilla && (
                  <div className="mb-4">
                    <p className="body-small font-semibold text-gray mb-1">Villa:</p>
                    <p className="body-regular text-dark">{selectedVilla.name}</p>
                  </div>
                )}
                
                {selectedActivities.length > 0 && (
                  <div>
                    <p className="body-small font-semibold text-gray mb-2">
                      Activities ({selectedActivities.length}):
                    </p>
                    <ul className="space-y-1">
                      {selectedActivities.map(activity => (
                        <li key={activity.id} className="body-small text-dark flex items-center gap-2">
                          <span className="text-luxury-gold">•</span>
                          {activity.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form 
              name="contact" 
              method="POST" 
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Netlify Forms required fields */}
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" />
              
              {/* Hidden fields for villa and activities */}
              <input type="hidden" name="villa-selected" value={selectedVilla?.name || ''} />
              <input type="hidden" name="activities-selected" value={selectedActivities.map(a => `${a.name} (${a.duration})`).join(', ')} />
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block body-regular font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block body-regular font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block body-regular font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Travel Date & Number of People Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="travelDate" className="block body-regular font-semibold mb-2">
                    Preferred Travel Date *
                  </label>
                  <input
                    type="date"
                    id="travelDate"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.travelDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.travelDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.travelDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="numberOfPeople" className="block body-regular font-semibold mb-2">
                    Number of Guests *
                  </label>
                  <select
                    id="numberOfPeople"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select number</option>
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                    <option value="5">5 guests</option>
                    <option value="6">6 guests</option>
                    <option value="7">7 guests</option>
                    <option value="8">8 guests</option>
                    <option value="9">9 guests</option>
                    <option value="10">10 guests</option>
                    <option value="10+">More than 10 guests</option>
                  </select>
                  {errors.numberOfPeople && (
                    <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block body-regular font-semibold mb-2">
                  Additional Information *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us about your vacation plans, special requirements, or any questions you have..."
                ></textarea>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-luxury w-full py-4 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Submit Inquiry'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactFormSection;
