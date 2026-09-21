import "./Dashboard.css";

const EnquiryData = ({ enquiryData }) => {
  return (
    <div className="enquiry_data">
      <div className="page-header">
        <div>
          <span className="page-label">ENQUIRY MANAGEMENT</span>
          <h1>Enquiries Data</h1>
          <p>View and manage customer enquiries from your Zyora store.</p>
        </div>
      </div>
      <div className="contact_data_head">
        <p>Name</p>
        <p>Contact</p>
        <p>Message</p>
        <p>Date</p>
      </div>
      {enquiryData.length === 0 ? (
        <p>No enquiry data found.</p>
      ) : (
        enquiryData.map((item) => (
          <div key={item._id} className="contact_data_list">
            <p>{item.name}</p>
            <div>
              <p>{item.email}</p>
              <p>{item.phone}</p>
            </div>
            <p>{item.message}</p>
            <p>
              {new Date(item.createdAt).toLocaleDateString("en-IN")}
              <br />
              {new Date(item.createdAt).toLocaleTimeString("en-IN")}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default EnquiryData;
