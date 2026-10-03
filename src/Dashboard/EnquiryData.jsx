import { useMemo, useState } from "react";
import "./Management.css";

const EnquiryData = ({ enquiryData }) => {
  const [search, setSearch] = useState("");
  const visibleEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enquiryData;
    return enquiryData.filter((item) =>
      [item.name, item.email, item.phone, item.message]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [enquiryData, search]);

  const recentCount = enquiryData.filter((item) => {
    const createdAt = new Date(item.createdAt);
    const daysOld = (Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000);
    return Number.isFinite(createdAt.getTime()) && daysOld >= 0 && daysOld < 7;
  }).length;

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">ENQUIRY MANAGEMENT</span>
          <h1>Enquiries</h1>
          <p>Review customer messages and contact details from your Zyora store.</p>
        </div>
      </header>

      <section className="management-stats" aria-label="Enquiry summary">
        <article><span>Total enquiries</span><strong>{enquiryData.length}</strong></article>
        <article><span>Received in the last 7 days</span><strong>{recentCount}</strong></article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search enquiries"
          placeholder="Search name, email, phone, or message"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {visibleEnquiries.length === 0 ? (
        <p className="management-empty">
          {enquiryData.length ? "No enquiries match your search." : "No enquiries have been received yet."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table enquiries-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {visibleEnquiries.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.name || "—"}</strong></td>
                  <td>
                    <strong>{item.email || "—"}</strong>
                    <small>{item.phone || "—"}</small>
                  </td>
                  <td className="enquiry-message">{item.message || "—"}</td>
                  <td>{item.createdAt ? (
                    <>
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                      <small>{new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small>
                    </>
                  ) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default EnquiryData;
