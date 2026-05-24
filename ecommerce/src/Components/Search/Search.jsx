import { useEffect, useState } from 'react';
import Item from '../Item/Item';
import { useLocation } from 'react-router-dom';

const Search = () => {
    const [results, setResults] = useState([]);
    const { search } = useLocation(); // Access URL query params
    const query = new URLSearchParams(search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            try {
                const res = await fetch(`http://localhost:4000/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error('Failed to fetch search results:', error);
            }
        };

        fetchResults();
    }, [query]);
    return (
        <div style={{paddingTop:'70px',paddingBottom:'70px' , height:'fit-content'}}>
            <div style={{height:"fit-content"}} className="relatedProducts">
                <h2>Results for {query}</h2>
                {results.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    <div className="relatedProducts-items">
                        {results.map((item, i) => {
                            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
                        })}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Search