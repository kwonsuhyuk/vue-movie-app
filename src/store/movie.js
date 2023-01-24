import axios from "axios";
import _uniqBy from 'lodash/uniqBy'

const _defaultMessage = 'Search for the movie title!'

export default {
  //module ! 
  namespaced : true,
  //data!
  state : () => ({
    movies:[],
    message : _defaultMessage,
    loading : false,
    theMovie : {}
  }),
  //computed!
  getters : {},
  //methods!
  // 변이 (데이터의 수정은 mutations 을 통해서만 가능하다)
  mutations: {
    updateState(state, payload) {
      // ['movies' , 'message' , 'loading']
      Object.keys(payload).forEach(key => {
        state[key] = payload[key]
      })
    },
    resetMovies(state) {
      state.movies = []
      state.message = _defaultMessage
      state.loading = false
    }
  },
  //actions 에서는 수정 허용하지 않음 & 비동기 
  actions: {
    async searchMovies({state,commit}, payload) {
      if(state.loading) 
        // 동시에 여러번 실행하는 것을 방지 할 수 있다 .
        return
      

      commit('updateState', {
        message : '',
        loading :true
      })
      try{
         //Search movies
        const res = await _fetchMovie({
          ...payload,
          page : 1
        })
        const { Search, totalResults } = res.data;
        commit('updateState', {
          movies : _uniqBy(Search, 'imdbID')
        })
        
        const total = parseInt(totalResults, 10) // 10진법 (정수)
        const pageLength = Math.ceil(total / 10)

        // 추가 요청! 
        if (pageLength > 1) {
          for (let page = 2; page <= pageLength ; page ++) {
            if (page > (payload.number / 10)) break;
            const res = await _fetchMovie({
              ...payload,
              page
            })
            const { Search } = res.data;
            commit('updateState' , {
              movies: [...state.movies, ..._uniqBy(Search, 'imdbID')]
            })
          }
        }
      }catch(message){
        commit('updateState', {
          message,
          movies : [],
        })
      } finally{
        commit('updateState' , {
          loading:false
        })
      }
    },
    async searchMovieWithId({state, commit}, payload) {
      if (state.loading) return  

      commit('updateState' , {
        theMovie : {},
        loading : true
      })
      
      try{
        const res = await _fetchMovie(payload)
        console.log(res.data)
        commit('updateState' , {
          theMovie : res.data
        })
      }catch (error) {
        commit('updateState' , {
          theMovie : {}
        })
      } finally {
        commit('updateState' , {
          loading : false
        })
      }
    }
  }
}


function _fetchMovie(payload) {
  const {title, type, page, year, id} = payload;
  const OMDB_API_KEY = '7035c60c';
  const url = id
    ? `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}` 
    : `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${title}&type=${type}&y=${year}&page=${page}`
  
  return new Promise((resolve, reject)=> {
    axios.get(url)
      .then((response) => {
        if (response.data.Error) {
          reject(response.data.Error)
        }
        resolve(response)
      })
      .catch((err) => {
        reject(err.message)
      })
      
  })

}