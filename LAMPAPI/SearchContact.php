<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    include 'db.php';
    include 'messages.php';

    $inData = getRequestInfo();

    $searchResult = "";
    $searchCount = 0;
    $userId = $inData["userId"];

    $words = preg_split('/\s+/', trim($inData["search"]));

    
    $sql = "SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserId = ?";

    $types = "i";
    $params = [$userId];

    $sql .= " AND (";

    foreach ($words as $i => $word) {
        if ($i > 0) {
            $sql .= " OR ";
        }
        $sql .= "(FirstName LIKE ? OR LastName LIKE ?)";
        $types .= "ss";
        $params[] = "%$word%";
        $params[] = "%$word%";
    }
    $sql .= ")";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    $result = $stmt->get_result();

    while($row = $result->fetch_assoc())
    {
        if( $searchCount > 0 )
        {
            $searchResult .= ",";
        }
        $searchCount++;
        $searchResult .= '{"id":' . $row["ID"] . ',"firstName":"' . $row["FirstName"] . '","lastName":"' . $row["LastName"] . '","phone":"' . $row["Phone"] . '","email":"' . $row["Email"] . '"}';
    }

    if( $searchCount == 0 )
    {
        returnWithError( "No Records Found" );
    }
    else
    {
        returnSearchInfo( $searchResult );
    }
    $stmt->close();
    $conn->close();



?>