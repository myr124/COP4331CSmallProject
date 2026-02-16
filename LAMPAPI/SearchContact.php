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


    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email from Contacts where FirstName like ? AND UserId = ?");
    $contactSearch = "%" . $inData["search"] . "%";
    $stmt->bind_param("si", $contactSearch, $userId);
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