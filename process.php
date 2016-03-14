<?php
$months = range(1,12);

// All states temp & precip
$state_list = array(
    'AL' => 1,
    'AK' => 50,
    'AZ' => 2,
    'AR' => 3,
    'CA' => 4,
    'CO' => 5,
    'CT' => 6,
    'DE' => 7,
    'FL' => 8,
    'GA' => 9,
    'HI' => 51,
    'ID' => 10,
    'IL' => 11,
    'IN' => 12,
    'IA' => 13,
    'KS' => 14,
    'KY' => 15,
    'LA' => 16,
    'ME' => 17,
    'MD' => 18,
    'MA' => 19,
    'MI' => 20,
    'MN' => 21,
    'MS' => 22,
    'MO' => 23,
    'MT' => 24,
    'NE' => 25,
    'NV' => 26,
    'NH' => 27,
    'NJ' => 28,
    'NM' => 29,
    'NY' => 30,
    'NC' => 31,
    'ND' => 32,
    'OH' => 33,
    'OK' => 34,
    'OR' => 35,
    'PA' => 36,
    'RI' => 37,
    'SC' => 38,
    'SD' => 39,
    'TN' => 40,
    'TX' => 41,
    'UT' => 42,
    'VT' => 43,
    'VA' => 44,
    'WA' => 45,
    'WV' => 46,
    'WI' => 47,
    'WY' => 48
);
/*
foreach($state_list as $state => $code) {
    foreach($months as $month) {
        if($month < 10) { $month = "0" . $month; }

        $links = [
            'temp' =>  "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/tavg/1/$month/1895-2015.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            'precip' => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/pcp/1/$month/1895-2015.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            'drought' => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/pdsi/1/$month/1895-2015.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            'cooling' => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/cdd/1/$month/1895-2015.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            'warming' => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/hdd/1/$month/1895-2015.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            "max" => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/tmax/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
            "min" => "http://www.ncdc.noaa.gov/cag/time-series/us/$code/00/tmin/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000"
        ];

        foreach($links as $type => $link) {
            $ch = curl_init($link);
            $fp = fopen("state_data/$type/$state" . '_' . "$month.csv", "wb");

            curl_setopt($ch, CURLOPT_FILE, $fp);
            curl_setopt($ch, CURLOPT_HEADER, 0);

            curl_exec($ch);
            curl_close($ch);
            fclose($fp);
        }

        echo $month . " processed\n";
    }
    echo $state . " processed\n";
}



// Contiguous US temp & precip data
foreach($months as $month) {
    if($month < 10) { $month = "0" . $month; }

    $us_links = [
        "temp" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/tavg/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "precip" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/pcp/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "drought" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/pdsi/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "cooling" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/cdd/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "warming" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/hdd/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "max" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/tmax/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000",
        "min" => "http://www.ncdc.noaa.gov/cag/time-series/us/110/00/tmin/1/$month/1895-2016.csv?base_prd=true&firstbaseyear=1901&lastbaseyear=2000"
    ];

    foreach($us_links as $type => $us_link) {
        $ch = curl_init($us_link);
        $fp = fopen("us_data/$type/US_$month.csv", "wb");

        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);

        curl_exec($ch);
        curl_close($ch);
        fclose($fp);
    }

    echo $month . " processed\n";
} */

// Aggregate Files
function build($path, $states, $fh) {
    foreach($states as $state_file) {
        $state_name = preg_split('/_/', $state_file)[0];

        if (($handle = fopen($path . $state_file, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if(preg_match('/^\d/', $data[0])) {
                    $year = substr($data[0], 0, 4);
                    $month = substr($data[0], 4);
                    $data[0] = $year;
                    $data[3] = $month;
                    $data[4] = $state_name;

                    fputcsv($fh, $data);
                }
            }
            fclose($handle);
        }
    }

    return $fh;
}

$types = ['state_data', 'us_data'];
$fields = ['drought', 'max', 'min', 'precip', 'temp'];
$headers = ['year', 'value', 'anomaly', 'month', 'state'];

// Aggregate all by type
/*
foreach($types as $type) {
    foreach($fields as $field) {
        $values = scandir("$type/$field");

        $fh = fopen($type . '_' . $field . '_all.csv', 'wb');
        fputcsv($fh, $headers);
        build("$type/$field/", $values, $fh);
        fclose($fh);
    }
} */

// Aggregate all by state
$headers[] = 'type';
$by_states = scandir('all');
$states = [];
$us = [];

foreach($by_states as $s) {
    if(preg_match('/^us/', $s)) {
        $us[] = $s;
    } elseif(preg_match('/^\./', $s)) {
        continue;
    } else {
        $states[] = $s;
    }
}

$fg = fopen('all_by_state/US.csv', 'wb');
fputcsv($fg, $headers);

foreach($us as $u) {
    $type = explode('_', $u)[2];

    if (($handle = fopen("all/$u", "r")) !== FALSE) {
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if(preg_match('/^\d/', $data[0])) {
                $data[5] = $type;
                fputcsv($fg, $data);
            }
        }
        fclose($handle);
    }
}
fclose($fg);

foreach($state_list as $state => $code) {
    $ft = fopen("all_by_state/$state.csv", "wb");
    fputcsv($ft, $headers);

    foreach($by_states as $state_file) {
        $type = explode('_', $state_file)[2];

        if(($handle = fopen("all/$state_file", "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                if($data[4] == $state) {
                    $data[5] = $type;
                    fputcsv($ft, $data);
                }
            }
        }
    }
    fclose($ft);
}