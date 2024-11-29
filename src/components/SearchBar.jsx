const SearchBar = ({ updateAddressParams }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateAddressParams({ [name]: value });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <div>
        <label>Pais:</label>
        <input
          type="text"
          name="pais"
          onChange={handleInputChange}
          placeholder="Ej: Uruguay"
        />
      </div>
      <div>
        <label>Departamento:</label>
        <input
          type="text"
          name="departamento"
          onChange={handleInputChange}
          placeholder="Ej: Montevideo"
        />
      </div>
      <div>
        <label>Calle:</label>
        <input
          type="text"
          name="calle"
          onChange={handleInputChange}
          placeholder="Ej: 18 de Julio"
        />
      </div>
      <div>
        <label>Número:</label>
        <input
          type="text"
          name="numero"
          onChange={handleInputChange}
          placeholder="Ej: 1234"
        />
      </div>
      <div>
        <label>Esquina:</label>
        <input
          type="text"
          name="esquina"
          onChange={handleInputChange}
          placeholder="Ej: Ejido"
        />
      </div>
    </div>
  );
};

export default SearchBar;
