import "./Dashboard.css";

const Home = ({ totalEnquiries }) => {
  return (
    <div className="Dashboard_home">
      <h1>Home</h1>
      <section>
        <div>
          <p>Total no.of Enquiries</p>
          <h1>{totalEnquiries}</h1>
        </div>
      </section>
    </div>
  );
};

export default Home;
