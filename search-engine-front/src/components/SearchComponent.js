import React, { useState } from 'react';
import Accordion from './Accordion';
import axios from 'axios';
import './styles.css'

const SearchComponent = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [filterResults, setFilterResults] = useState([]);
    const [filterArray, setFilterArray] = useState([])
    const [selectedFilter,setSelectedFilter] = useState()

    const handleSearch = async () => {
        try {
            // Make a GET request to your backend API with the search term
            const response = await axios.post('http://localhost:3000/search', {
                query: searchTerm
            });
            console.log("response", response)

            // Assuming the API returns search results in response.data
            const searchResults = response.data.hits;
            const filterResults = response.data.aggs;

            // Update the state with the search results
            setFilterResults(filterResults)
            setSearchResults(searchResults);
        } catch (error) {
            // Handle any errors that occur during the request
            console.error('Error while searching:', error);
        }
    };


    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const handleFilterChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedFilter(selectedValue)
        // var sear
        if (selectedValue == "Poem") {
            // setSearchResults()
            
            setFilterArray(filterResults.poem_filter.buckets)
        } else if (selectedValue == "Year") {
            setFilterArray(filterResults.year_filter.buckets)
        } else if (selectedValue == "Poet") {
            setFilterArray(filterResults.poet_filter.buckets)
        } else if (selectedValue == "Book") {
            setFilterArray(filterResults.book_filter.buckets)

        }
    };


    const handleFilterArrayChange = (event) => {
        const selectedValue = event.target.value;
        // setSelectedFilter(selectedValue);
        var array1 = [];
        console.log("selected",selectedFilter)
        console.log("passed",selectedValue)
        console.log(searchResults)
    
        if (selectedFilter == "Poem") {
            console.log("dfsfaf")
            // Filter and update array1 based on the selectedValue
            array1 = searchResults.filter((result) => result._source['Poem name'] === selectedValue);
            
        }
    
        else if (selectedFilter == "Year") {
            array1 = searchResults.filter((result) => result._source['year'] === selectedValue);
            // setFilterArray(filterResults.year_filter.buckets);
        } else if (selectedFilter == "Poet") {
            array1 = searchResults.filter((result) => result._source['Poet'] === selectedValue);
            // setFilterArray(filterResults.poet_filter.buckets);
        } else if (selectedFilter == "Book") {
            array1 = searchResults.filter((result) => result._source['Book'] === selectedValue);
            // setFilterArray(filterResults.book_filter.buckets);
        } else {
            // Handle the case where selectedValue doesn't match any expected values
            console.error(`Unknown selectedValue: ${selectedFilter}`);
        }
        console.log("array1",array1)
        setSearchResults(array1)
    };
    
    return (
        <>
            <div className='search-div'>
                <input
                    type="text"
                    placeholder="Enter your search query..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                />

                <button onClick={handleSearch} style={{ marginRight: '10px' }}>Search</button>

                <select className="custom-select" onChange={handleFilterChange}>
                    {console.log(filterResults)}

                    <option value="default" selected disabled>Filter</option>
                    <option value='Poem'>Poem</option>
                    <option value='Year'>Year</option>
                    <option value='Poet'>Poet</option>
                    <option value='Book'>Book</option>
                </select>

                <select className="custom-select" onChange={handleFilterArrayChange}>
                    {filterArray.length > 0 && filterArray.map((result, index) => (
                        <option value={result.key} >{result.key}</option>

                    ))}
                </select>




            </div>
            <div></div>
            {/* <div>
      {searchResults.length>0 && <h1>Results</h1>}
        {searchResults.length>0 && searchResults.map((result, index) => (
    
     
      <Accordion result={result} title="Section 1" content="This is the content of Section 1." />
    

        ))}
       {searchResults.length === 0 && <h1>No Results to display</h1>}
        </div> */}
            <div>
                {searchResults.length === 0 ? (
                    <h1>No Results to display</h1>
                ) : (
                    // Render your search results here
                    <div>
                        {searchResults.map((result, index) => (
                            // Render each search result item here
                            //   <div key={index}>{result}</div>
                            <Accordion result={result} title="Section 1" content="This is the content of Section 1." />
                        ))}
                    </div>
                )}
            </div>




        </>
    );
};

export default SearchComponent;
