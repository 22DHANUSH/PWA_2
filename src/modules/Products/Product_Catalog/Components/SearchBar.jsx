import { AutoComplete, Input } from "antd";
import { useState, useEffect } from "react";
import { mapToRequestPayload } from "../../MapToRequestPayload";
import { useProducts } from "../../ProductContext";
import { searchProducts } from "../../products.api";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const { filters, setFilters } = useProducts();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (query.length > 1) {
          try {
            const payload = mapToRequestPayload({
              ...filters,
              searchTerm: query,
            });

            const res = await searchProducts(payload);
            const formatted = (res || []).map((item) => ({
              value: item.productName,
              label: (
                <div>
                  <strong>{item.productName}</strong>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {item.categoryName || "Product"}
                  </div>
                </div>
              ),
            }));
            setOptions(formatted);
          } catch (err) {
            console.error("Error fetching suggestions:", err);
            setOptions([]);
          }
        } else {
          setOptions([]);
        }
      };

      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = (value) => {
    const matchedOption = options.find(
      (opt) => opt.value.toLowerCase() === value.toLowerCase()
    );

    const confirmedSearchTerm = matchedOption ? matchedOption.value : value;

    setFilters({
      ...filters,
      searchTerm: confirmedSearchTerm,
    });
  };

  return (
    <div style={{ maxWidth: 400, marginBottom: 24, marginLeft: 15 }}>
      <AutoComplete
        options={options}
        style={{ width: "100%" }}
        onSearch={(text) => setQuery(text)}
        placeholder="Search for products"
        filterOption={false}
      >
        <Input.Search enterButton onSearch={handleSearch} allowClear />
      </AutoComplete>
    </div>
  );
}

export default SearchBar;
