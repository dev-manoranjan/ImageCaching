import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
  ImageBackground,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

const dbName = 'ImgCache';
const tableName = 'ImageDetail';

const db = SQLite.openDatabase(
  {
    name: dbName,
    location: 'default',
  },
  () => {},
  error => {
    console.log(error);
  },
);

const App = () => {
  const [imgData, setImgData] = useState([]);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ${tableName} (char_id INTEGER PRIMARY KEY, name TEXT, birthday TEXT, occupation TEXT, img TEXT, status TEXT, nickname TEXT, appearance TEXT, portrayed TEXT, category TEXT, better_call_saul_appearance TEXT);`,
      );
    });
  };

  const insertDataToLocalDB = async data => {
    await db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ${tableName} VALUES (?,?,?,?,?,?,?,?,?,?,?) `,
        data,
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('inserted successfully: ' + results.rowsAffected);
          } else {
            console.log('insertion failed');
          }
        },
      );
    });
  };

  const getDataFromRemote = async () => {
    try {
      const response = await fetch(
        'https://www.breakingbadapi.com/api/characters',
      );
      const responseJson = await response.json();
      if (responseJson.length) {
        responseJson.forEach(element => {
          insertDataToLocalDB([
            element.char_id,
            element.name,
            element.birthday,
            JSON.stringify(element.occupation),
            element.img,
            element.status,
            element.nickname,
            JSON.stringify(element.appearance),
            element.portrayed,
            element.category,
            JSON.stringify(element.better_call_saul_appearance),
          ]);
        });
        setImgData(responseJson);
      }
    } catch (err) {
      console.log('Error occured: ' + err);
    }
  };

  const getData = async () => {
    await db.transaction(tx => {
      tx.executeSql(`SELECT * FROM ${tableName}`, [], (tx, results) => {
        if (results.rows.length > 0) {
          let tempArr = [];
          for (let i = 0; i < results.rows.length; ++i)
            tempArr.push(results.rows.item(i));
          setImgData(tempArr);
        } else {
          getDataFromRemote();
        }
      });
    });
  };

  useEffect(() => {
    createTable();
    getData();
  }, []);

  const _renderItem = ({item}) => {
    return (
      <View style={styles.imgContainer}>
        <ImageBackground
          source={{uri: item.img}}
          style={styles.imgStyle}
          imageStyle={styles.imageStyle}>
          <View style={styles.textContainer}>
            <Text style={styles.textStyle}>{item.nickname}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar barStyle={'dark-content'} backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <FlatList
          data={imgData}
          renderItem={_renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={{paddingHorizontal: 20}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  imgStyle: {
    width: undefined,
    height: undefined,
    flex: 1,
    borderRadius: 10,
    resizeMode: 'cover',
    justifyContent: 'flex-end',
  },
  imgContainer: {
    width: '100%',
    height: 250,
    marginVertical: 7,
    borderRadius: 10,
  },
  imageStyle: {borderRadius: 10},
  textContainer: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000c0',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  textStyle: {fontSize: 15, color: '#FFFFFF'},
});

export default App;
