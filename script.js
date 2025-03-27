trend = []
const baseUrl = 'https://cisl-chords.cloud.ucar.edu/api/v1/data';

document.addEventListener('DOMContentLoaded', () => {
    fetchWeather(chords_id);
});

function getDtIcon(h) {
    // https://bas.dev/work/meteocons
    if (h > 6 && h < 18) {
        return "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg-static/clear-day.svg";
    } else {
        return "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg-static/clear-night.svg";
    }
}

function setPm25Status(pm) {
    if (pm < 10) document.getElementById('current-pm').style.color = "#95f70c";        
    else if (pm < 25) document.getElementById('current-pm').style.color = "#fcf805";        
    else document.getElementById('current-pm').style.color = "#fc0505";        
}

function fetchWeather(chords_id) {

    let date = new Date();
    dt_mo = date.toLocaleString('en-US', {month: '2-digit', timeZone: 'America/Denver'  });
    dt_d  = date.toLocaleString('en-US', {day: '2-digit', timeZone: 'America/Denver' });
    dt_y  = date.toLocaleString('en-US', {year: 'numeric', timeZone: 'America/Denver' });
    dt_m  = date.toLocaleString('en-US', {minute: '2-digit', timeZone: 'America/Denver' });
    dt_h  = date.toLocaleString('en-US', {hour: '2-digit',  hour12: false, timeZone: 'America/Denver' });

    let now = `${dt_y}-${dt_mo}-${dt_d}T${dt_h}:${dt_m}`;
    let start = new Date(+date - 60000*15);

    dt_mo = start.toLocaleString('en-US', {month: '2-digit', timeZone: 'America/Denver'  });
    dt_d  = start.toLocaleString('en-US', {day: '2-digit', timeZone: 'America/Denver' });
    dt_y  = start.toLocaleString('en-US', {year: 'numeric', timeZone: 'America/Denver' });
    dt_m  = start.toLocaleString('en-US', {minute: '2-digit', timeZone: 'America/Denver' });
    dt_h  = start.toLocaleString('en-US', {hour: '2-digit',  hour12: false, timeZone: 'America/Denver' });
    let end = `${dt_y}-${dt_mo}-${dt_d}T${dt_h}:${dt_m}`;

    fetch(`${baseUrl}/${chords_id}.json?start=${now}&end=${end}`)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response;  
        })
        .then(response => response.json())
        .then(data => {
            let site =  data['features'][0]['properties']['instrument'];
            let measurements = data['features'][0]['properties']['data'];

            let temp = 0;
            let rh = 0;
            let voc = 0;
            let pm25 = 0;
            let pressure = 0;

            let t_count = 0;
            let rh_count = 0;
            let voc_count = 0;
            let pm25_count = 0;
            let pressure_count = 0;

            measurements.forEach(item => {
                console.log(item);
                
                Object.entries(item.measurements).forEach( ([k,v]) => {
                    switch(k) {
                        case "sp1":
                            pressure += v;
                            pressure_count += 1;
                            break
                        case "t1":
                            temp += v;
                            t_count += 1;
                            break;
                        case "rh1":
                            rh += v;
                            rh_count += 1;
                            break;
                        case "voc1":
                            voc += v;
                            voc_count += 1;
                            break;
                        case "pm25env":
                            pm25 += v;
                            pm25_count += 1;
                            break;                          
                        default:
                            break;
                    }
                })
            });

            console.log(temp / t_count);
            console.log(rh / rh_count);
            console.log(voc / voc_count);
            console.log(pm25 / pm25_count);
            console.log(pressure / pressure_count);

            let date = new Date();

            t = date.toLocaleString('en-US', 
                {
                    hour: '2-digit',  minute: '2-digit', 
                    hour12: false, 
                    timeZone: 'America/Denver' 
                });
            dt_m   = date.toLocaleString('en-US', {month: 'short' });
            dt_d   = date.toLocaleString('en-US', {day: 'numeric' });
            dt_dow = date.toLocaleString('en-US', {weekday: 'long' });
            dt_hr  = date.toLocaleString('en-US', {hour: '2-digit', hour12: false });

            let current_time = `${t} | ${dt_d} ${dt_m} | ${dt_dow}`;
            // https://bas.dev/work/meteocons

            document.getElementById('tod-icon').src = `${getDtIcon(dt_hr)}`;        
            document.getElementById('displayed-city').textContent = `${site}`;        
            document.getElementById('pressure').textContent = `${(0.01*((pressure / pressure_count))).toFixed(2)} hpa`;        // convert to inhg, use * 0.02953
            
            if (pm25_count) document.getElementById('current-pm').textContent = `${( pm25 / pm25_count).toFixed(1)}`;   
            
            setPm25Status(( pm25 / pm25_count).toFixed(1));

            document.getElementById('current-time').textContent = `${current_time}`;        
            document.getElementById('current-temperature').textContent = `${((( temp / t_count) * 1.8) + 32).toFixed(1)}`;
            document.getElementById('humidity').textContent = `${( rh / rh_count).toFixed(1)}%`;
            // document.getElementById('VOC').textContent = `${Math.round( voc / voc_count)}`;

            document.getElementById('attr-line').innerHTML = `<a href="https://cisl-chords.cloud.ucar.edu/instruments/${chords_id}">Data</a> provided by <a href="https://earthcubeprojects-chords.github.io/chords-docs/">CHORDS.<\a>`;

        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    }