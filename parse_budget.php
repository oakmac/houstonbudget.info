<?php

$file = file('data/fy2013-adopted-budget.csv');

$data = array();
$skippedFirst = false;
foreach ($file as $rowStr) {
  // skip the first row
  if ($skippedFirst === false) {
    $skippedFirst = true;
    continue;
  }

  $rowArr = explode(',', $rowStr);

  $rowArr2 = array();
  $rowArr2['fundNum'] = $rowArr[0];
  $rowArr2['fundName'] = $rowArr[1];
  $rowArr2['deptNum'] = $rowArr[2];
  $rowArr2['deptName'] = $rowArr[3];
  $rowArr2['ccNum'] = $rowArr[4];
  $rowArr2['ccName'] = $rowArr[5];
  $rowArr2['acctNum'] = $rowArr[6];
  $rowArr2['acctName'] = $rowArr[7];

  foreach ($rowArr2 as $key => $value) {
    $rowArr2[$key] = trim($value);
  }

  $rowArr2['value'] = getValue($rowArr);

  array_push($data, $rowArr2);
}


echo json_encode($data);

die;

function getValue($arr) {
  $value = $arr[8] . $arr[9] . $arr[10] . $arr[11];
  $value = str_replace('"', '', $value);
  $value = trim($value);
  
  // is it a negative value?
  if (strstr($value, '(') !== false) {
    $value = str_replace('(', '', $value);
    $value = str_replace(')', '', $value);
    $value = '-' . $value;
  }

  return intval($value, 10);
}

?>